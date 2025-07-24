import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.1.104:4000/api';
  static ApiService? _instance;

  static ApiService get instance {
    _instance ??= ApiService._();
    return _instance!;
  }

  ApiService._();

  // Headers for requests
  Map<String, String> get _headers => {
    'Content-Type': 'application/json; charset=UTF-8',
  };

  // Kullanıcı kayıt
  Future<Map<String, dynamic>> register({
    required String email,
    required String username,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
    required DateTime birthDate,
    required String gender,
    required String city,
    String? inviteCode,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'username': username,
          'password': password,
          'name': '$firstName $lastName',
          'age': DateTime.now().year - birthDate.year,
          'gender': gender.toLowerCase(),
          'city': city,
        }),
      );

      final result = _handleResponse(response);
      
      if (result['success'] == null) {
        // Backend'den gelen user varsa başarılı
        if (result['user'] != null) {
          result['success'] = true;
        } else {
          result['success'] = false;
        }
      }

      return result;
    } catch (e) {
      debugPrint('Kayıt hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası oluştu'};
    }
  }

  // Kullanıcı giriş
  Future<Map<String, dynamic>> login(
    String emailOrUsername,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'email': emailOrUsername,
          'password': password,
        }),
      );

      final result = _handleResponse(response);

      if (result['success'] == null) {
        // Backend'den gelen user varsa başarılı
        if (result['user'] != null) {
          result['success'] = true;
          // Token'ı sakla (şimdilik token yok, user id kullan)
          await _saveUserId(result['user']['id'].toString());
        } else {
          result['success'] = false;
        }
      }

      return result;
    } catch (e) {
      debugPrint('Giriş hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası oluştu'};
    }
  }

  // Aktif anketleri getir
  Future<List<Map<String, dynamic>>> getSurveys() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/mobile/surveys'),
        headers: _headers,
      );

      final result = _handleResponse(response);

      if (result['success']) {
        return List<Map<String, dynamic>>.from(result['surveys']);
      } else {
        throw Exception(result['message']);
      }
    } catch (e) {
      debugPrint('Anketler getirilirken hata: $e');
      return [];
    }
  }

  // Kullanıcı profilini getir
  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/mobile/user/profile/$userId'),
        headers: _headers,
      );

      final result = _handleResponse(response);

      if (result['success']) {
        return result['user'];
      } else {
        throw Exception(result['message']);
      }
    } catch (e) {
      debugPrint('Kullanıcı profili getirilirken hata: $e');
      return null;
    }
  }

  // Kullanıcı profilini güncelle
  Future<Map<String, dynamic>> updateUserProfile({
    required String userId,
    String? name,
    String? email,
    String? username,
    String? gender,
    String? city,
    String? profileImage,
    String? phone,
    int? age,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/users/$userId'),
        headers: _headers,
        body: jsonEncode({
          if (name != null) 'name': name,
          if (email != null) 'email': email,
          if (username != null) 'username': username,
          if (gender != null) 'gender': gender,
          if (city != null) 'city': city,
          if (profileImage != null) 'profileImage': profileImage,
          if (phone != null) 'phone': phone,
          if (age != null) 'age': age,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      debugPrint('Profil güncelleme hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası oluştu'};
    }
  }

  // Anket tamamla
  Future<Map<String, dynamic>> completeSurvey(
    String surveyId,
    String userId,
    Map<String, dynamic> answers,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/mobile/surveys/$surveyId/complete'),
        headers: _headers,
        body: jsonEncode({'userId': userId, 'answers': answers}),
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Anket tamamlanırken hata: $e');
      return {'success': false, 'message': 'Bağlantı hatası oluştu'};
    }
  }

  // Hikayeleri getir
  Future<List<Map<String, dynamic>>> getStories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/mobile/stories'),
        headers: _headers,
      );

      final result = _handleResponse(response);

      if (result['success']) {
        return List<Map<String, dynamic>>.from(result['stories']);
      } else {
        throw Exception(result['message']);
      }
    } catch (e) {
      debugPrint('Hikayeler getirilirken hata: $e');
      return [];
    }
  }

  // Hikaye görüntüleme kaydı
  Future<bool> markStoryAsViewed(String storyId, String userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/mobile/stories/$storyId/view'),
        headers: _headers,
        body: jsonEncode({'userId': userId}),
      );

      final result = _handleResponse(response);
      return result['success'] ?? false;
    } catch (e) {
      debugPrint('Hikaye görüntüleme kaydedilirken hata: $e');
      return false;
    }
  }

  // Mevcut kullanıcıyı getir
  Future<UserModel?> getCurrentUser() async {
    try {
      final userId = await _getUserId();
      if (userId == null) return null;

      final userProfile = await getUserProfile(userId);
      if (userProfile != null) {
        return UserModel.fromJson(userProfile);
      }
      return null;
    } catch (e) {
      debugPrint('Mevcut kullanıcı getirilirken hata: $e');
      return null;
    }
  }

  // Ürün satın alma
  Future<Map<String, dynamic>> purchaseProduct({
    required int productId,
    required String userId,
    required String size,
    required String color,
    int quantity = 1,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products/$productId/purchase'),
        headers: _headers,
        body: jsonEncode({
          'userId': userId,
          'size': size,
          'color': color,
          'quantity': quantity,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      debugPrint('Satın alma hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası oluştu'};
    }
  }

  // Leaderboard verisini getir
  Future<List<Map<String, dynamic>>> getLeaderboard() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/leaderboard'),
        headers: _headers,
      );
      final result = _handleResponse(response);
      if (result['leaderboard'] != null) {
        return List<Map<String, dynamic>>.from(result['leaderboard']);
      } else {
        return [];
      }
    } catch (e) {
      debugPrint('Leaderboard getirilirken hata: $e');
      return [];
    }
  }

  // Kullanıcı tarihçesini getir
  Future<Map<String, dynamic>> getHistory(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/history'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {};
      }
    } catch (e) {
      debugPrint('History getirilirken hata: $e');
      return {};
    }
  }

  // Map görevlerini getir
  Future<List<Map<String, dynamic>>> getMapTasks() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/map-tasks'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? List<Map<String, dynamic>>.from(data) : [];
      } else {
        return [];
      }
    } catch (e) {
      debugPrint('Map görevleri getirilirken hata: $e');
      return [];
    }
  }

  // Response'u handle et
  Map<String, dynamic> _handleResponse(http.Response response) {
    try {
    if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        // Backend'de success alanı yoksa, user varsa başarılı say
        if (body['user'] != null && body['success'] == null) {
          body['success'] = true;
        }
        return body;
    } else {
      final error = jsonDecode(response.body);
      return {
        'success': false,
        'message': error['message'] ?? 'Bilinmeyen hata oluştu',
        };
      }
    } catch (e) {
      debugPrint('Response parse hatası: $e');
      return {
        'success': false,
        'message': 'Geçersiz yanıt formatı: ${response.body}',
      };
    }
  }

  // User ID'yi kaydet
  Future<void> _saveUserId(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_id', userId);
  }

  // User ID'yi getir
  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }

  // Kullanıcı çıkış
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_id');
  }
}