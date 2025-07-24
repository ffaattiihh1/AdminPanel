import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import 'edit_profile_page.dart';
import '../../services/api_service.dart';
import 'package:flutter/services.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final userId = authService.currentUser?.id;
      if (userId == null) {
        setState(() {
          _error = 'Kullanıcı bulunamadı';
          _isLoading = false;
        });
        return;
      }
      final api = ApiService.instance;
      final data = await api.getUserProfile(userId.toString());
      setState(() {
        _user = data?['user'] ?? {};
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Bağlantı hatası';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _user ?? {};
    return Scaffold(
      backgroundColor: Colors.white,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      // Üst degrade ve profil resmi
                      Stack(
                        children: [
                          Container(
                            height: 160,
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Color(0xFF4FC3F7), Color(0xFF1976D2)],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                            ),
                          ),
                          // ID sağ üstte kopyalanabilir
                          Positioned(
                            right: 16,
                            top: 40,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      Text(
                                        'ID: #${user['user_code'] ?? user['id'] ?? 0}',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
                                      ),
                                      const SizedBox(width: 4),
                                      GestureDetector(
                                        onTap: () {
                                          Clipboard.setData(ClipboardData(text: (user['user_code'] ?? user['id'] ?? 0).toString()));
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(content: Text('ID kopyalandı'), duration: Duration(seconds: 1)),
                                          );
                                        },
                                        child: const Icon(Icons.copy, size: 16, color: Colors.blue),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Sadece ad-soyad, e-posta ve kullanıcı adı değerleri sola yaslı
                          Positioned(
                            left: 24,
                            top: 48,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  (user['name'] ?? '').toString().split(' ').map((e) => e.isNotEmpty ? e[0].toUpperCase() + e.substring(1).toLowerCase() : '').join(' '),
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                if ((user['email'] ?? '').toString().isNotEmpty)
                                  Text((user['email'] ?? '').toString(), style: const TextStyle(fontSize: 14, color: Colors.white70)),
                                if ((user['username'] ?? '').toString().isNotEmpty)
                                  Text('@${user['username']}', style: const TextStyle(fontSize: 14, color: Colors.white70)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 60),
                      // Ad, kullanıcı adı
                      Text(
                        (user['name'] ?? '').toString(),
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                      if ((user['username'] ?? '').toString().isNotEmpty)
                        Text('@${user['username']}', style: const TextStyle(fontSize: 16, color: Colors.blue)),
                      const SizedBox(height: 12),
                      // İstatistikler
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildStat('Tamamlanan Anket', user['completedSurveys'] ?? 0),
                          _buildStat('Toplam Puan', user['total_earnings'] ?? 0),
                          _buildStat('Hediye Çeki', user['giftCards'] ?? 0),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Profili Düzenle butonu
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1976D2),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            onPressed: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) => EditProfilePage(user: user),
                                ),
                              );
                              _fetchProfile();
                            },
                            child: const Text('PROFİLİ DÜZENLE', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Özellikler kartı
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _buildFeature(Icons.group_add, 'Arkadaşlar\nDavet Et'),
                                _buildFeature(Icons.bar_chart, 'İstatistikler'),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      // E-posta ve telefon onay
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          children: [
                            _buildVerifyRow('E-posta Adresi', user['email'] ?? '', user['emailVerified'] == true),
                            _buildVerifyRow('Telefon Numarası', user['phone'] ?? '', user['phoneVerified'] == true),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Ayarlar kartı
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Column(
                            children: [
                              SwitchListTile(
                                value: user['notificationsEnabled'] ?? true,
                                onChanged: (v) {},
                                title: const Text('Bildirimler'),
                              ),
                              ListTile(
                                title: const Text('Dil'),
                                trailing: const Text('Türkçe'),
                                onTap: () {},
                              ),
                              ListTile(
                                title: const Text('Gizlilik ve KVKK'),
                                onTap: () {},
                              ),
                              ListTile(
                                title: const Text('Yardım & Destek'),
                                onTap: () {},
                              ),
                              ListTile(
                                title: const Text('Hesabımı Sil', style: TextStyle(color: Colors.red)),
                                onTap: () {},
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStat(String label, int value) {
    return Column(
      children: [
        Text('$value', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF3498DB))),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildFeature(IconData icon, String label) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: const Color(0xFF3498DB),
          child: Icon(icon, color: Colors.white),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildVerifyRow(String label, String value, bool verified) {
    return ListTile(
      title: Text(label),
      subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      trailing: verified
          ? const Icon(Icons.verified, color: Colors.green)
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Onaylanmadı', style: TextStyle(color: Colors.red)),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(minimumSize: const Size(60, 32)),
                  child: const Text('ONAYLA'),
                ),
              ],
            ),
    );
  }
} 