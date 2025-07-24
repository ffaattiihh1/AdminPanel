import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  UserModel? _currentUser;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  final ApiService _apiService = ApiService.instance;

  // Başlangıçta kullanıcının giriş yapmış olup olmadığını kontrol et
  Future<void> checkAuthStatus() async {
    _setLoading(true);

    try {
      final user = await _apiService.getCurrentUser();
      if (user != null) {
        _currentUser = user;
        _isAuthenticated = true;
      } else {
        _isAuthenticated = false;
        _currentUser = null;
      }
    } catch (e) {
      _isAuthenticated = false;
      _currentUser = null;
    }

    _setLoading(false);
  }

  // Giriş yap
  Future<Map<String, dynamic>> login(String email, String password) async {
    _setLoading(true);

    try {
      final result = await _apiService.login(email, password);

      // Success alanı null kontrolü
      final isSuccess = result['success'] == true || result['user'] != null;

      if (isSuccess) {
        _currentUser = result['user'] != null
            ? UserModel.fromJson(result['user'])
            : null;
        _isAuthenticated = true;

        // Kullanıcı bilgilerini local'de sakla
        if (_currentUser != null) {
          await _saveUserToLocal(_currentUser!);
        }
        
        // Success alanını güncelleyelim
        result['success'] = true;
      } else {
        _isAuthenticated = false;
        _currentUser = null;
        // Success alanını false yapalım  
        result['success'] = false;
      }

      _setLoading(false);
      return result;
    } catch (e) {
      _setLoading(false);
      _isAuthenticated = false;
      _currentUser = null;
      return {'success': false, 'message': 'Giriş yapılırken hata oluştu: $e'};
    }
  }

  // Kayıt ol
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phoneNumber,
    String? username,
    DateTime? birthDate,
    String? gender,
    String? city,
    String? inviteCode,
  }) async {
    _setLoading(true);

    try {
      final result = await _apiService.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber ?? '',
        username: username ?? '',
        birthDate: birthDate ?? DateTime.now(),
        gender: gender ?? '',
        city: city ?? '',
        inviteCode: inviteCode,
      );

      if (result['success']) {
        _currentUser = result['user'] != null
            ? UserModel.fromJson(result['user'])
            : null;
        _isAuthenticated = true;

        // Kullanıcı bilgilerini local'de sakla
        if (_currentUser != null) {
          await _saveUserToLocal(_currentUser!);
        }
      }

      _setLoading(false);
      return result;
    } catch (e) {
      _setLoading(false);
      return {'success': false, 'message': 'Kayıt olurken hata oluştu'};
    }
  }

  // Çıkış yap
  Future<void> logout() async {
    _setLoading(true);

    try {
      await _apiService.logout();
      _currentUser = null;
      _isAuthenticated = false;
      await _clearUserFromLocal();
    } catch (e) {
      // Hata olsa bile local'den temizle
    }

    _setLoading(false);
  }

  // Loading durumunu ayarla
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Kullanıcı bilgilerini local'de sakla
  Future<void> _saveUserToLocal(UserModel user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_user', user.toJson().toString());
    } catch (e) {
      // Local storage hatası
    }
  }

  // Kullanıcı bilgilerini local'den temizle
  Future<void> _clearUserFromLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('current_user');
    } catch (e) {
      // Local storage hatası
    }
  }

  // Email validasyonu
  bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  // Şifre validasyonu
  bool isValidPassword(String password) {
    return password.length >= 6;
  }

  // İsim validasyonu
  bool isValidName(String name) {
    return name.trim().length >= 2;
  }

  // Telefon validasyonu
  bool isValidPhone(String phone) {
    final phoneRegex = RegExp(r'^[0-9]{10,11}$');
    return phoneRegex.hasMatch(phone.replaceAll(RegExp(r'[^\d]'), ''));
  }
}
 