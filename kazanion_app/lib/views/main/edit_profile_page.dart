import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import '../../services/api_service.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';

class EditProfilePage extends StatefulWidget {
  final Map<String, dynamic> user;
  const EditProfilePage({super.key, required this.user});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  late TextEditingController _nameController;
  late TextEditingController _usernameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  String? _gender;
  String? _profileImage;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user['name'] ?? '');
    _usernameController = TextEditingController(text: widget.user['username'] ?? '');
    _emailController = TextEditingController(text: widget.user['email'] ?? '');
    _phoneController = TextEditingController(text: widget.user['phone'] ?? '');
    _gender = widget.user['gender'] ?? '';
    _profileImage = widget.user['profileImage'] ?? '';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (picked != null) {
      setState(() => _isLoading = true);
      // Demo: Base64 encode, gerçekte API'ye upload edilir ve URL alınır
      final bytes = await picked.readAsBytes();
      final base64 = base64Encode(bytes);
      // TODO: API'ye upload edip URL almak için backend endpointi kullanılmalı
      setState(() {
        _profileImage = 'data:image/jpeg;base64,$base64';
        _isLoading = false;
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final userId = authService.currentUser?.id?.toString() ?? widget.user['id']?.toString();
      if (userId == null) {
        setState(() {
          _isLoading = false;
          _error = 'Kullanıcı bulunamadı';
        });
        return;
      }
      final api = ApiService.instance;
      final result = await api.updateUserProfile(
        userId: userId,
        name: _nameController.text,
        email: _emailController.text,
        username: _usernameController.text,
        gender: _gender,
        phone: _phoneController.text,
        profileImage: _profileImage,
      );
      if (result['success'] == true) {
        setState(() { _isLoading = false; });
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profil başarıyla güncellendi'), backgroundColor: Colors.green),
        );
      } else {
        setState(() {
          _isLoading = false;
          _error = result['message'] ?? 'Profil güncellenemedi';
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Profil güncellenirken hata oluştu';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF3498DB),
        title: const Text('Profili Düzenle', style: TextStyle(color: Colors.white)),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Profil resmi
                  GestureDetector(
                    onTap: _pickImage,
                    child: CircleAvatar(
                      radius: 48,
                      backgroundImage: _profileImage != null && _profileImage!.isNotEmpty && !_profileImage!.startsWith('data:')
                          ? NetworkImage(_profileImage!)
                          : null,
                      child: _profileImage == null || _profileImage!.isEmpty
                          ? const Icon(Icons.person, size: 48, color: Colors.grey)
                          : null,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text('Fotoğraf Değiştir', style: TextStyle(color: Colors.blue)),
                  const SizedBox(height: 24),
                  // Ad Soyad
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Ad Soyad'),
                    enabled: false,
                  ),
                  const SizedBox(height: 12),
                  // Kullanıcı adı
                  TextField(
                    controller: _usernameController,
                    decoration: const InputDecoration(labelText: 'Kullanıcı Adı'),
                    enabled: false,
                  ),
                  const SizedBox(height: 12),
                  // E-posta
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'E-posta'),
                  ),
                  const SizedBox(height: 12),
                  // Telefon
                  TextField(
                    controller: _phoneController,
                    decoration: const InputDecoration(labelText: 'Telefon Numarası'),
                  ),
                  const SizedBox(height: 12),
                  // Cinsiyet
                  Row(
                    children: [
                      const Text('Cinsiyet: '),
                      Text(_gender ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Şifre değiştir
                  ExpansionTile(
                    title: const Text('Şifre Değiştir'),
                    children: [
                      TextField(
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'Mevcut Şifre'),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'Yeni Şifre'),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'Yeni Şifre Tekrar'),
                      ),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () {},
                        child: const Text('Şifreyi Değiştir'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (_error != null)
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _saveProfile,
                          child: const Text('KAYDET'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('İPTAL'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
} 