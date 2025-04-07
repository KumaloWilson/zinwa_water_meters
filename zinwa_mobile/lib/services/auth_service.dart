import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:zinwa_mobile_app/models/user_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';
import 'package:zinwa_mobile_app/utils/constants.dart';

class AuthService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();
  final GetStorage _storage = Get.find<GetStorage>();

  // Check if user is logged in
  bool get isLoggedIn => _storage.hasData(Constants.tokenKey);

  // Get current user
  User? get currentUser {
    final userData = _storage.read(Constants.userKey);
    if (userData != null) {
      return User.fromJson(userData);
    }
    return null;
  }

  // Get auth token
  String? get token => _storage.read(Constants.tokenKey);

  // Get current user from API
  Future<User> getCurrentUser() async {
    try {
      final response = await _apiService.get('/auth/me');

      final userData = response.data['user'];

      // Update stored user data with latest from server
      await _storage.write(Constants.userKey, userData);

      return User.fromJson(userData);
    } catch (e) {
      // If there's an error fetching the user, check if we have cached data
      final cachedUser = currentUser;
      if (cachedUser != null) {
        return cachedUser;
      }

      // If no cached user, rethrow the error
      rethrow;
    }
  }

  // Login
  Future<User> login(String email, String password) async {
    try {
      final response = await _apiService.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final token = response.data['token'];
      final userData = response.data['user'];

      // Save token and user data
      await _storage.write(Constants.tokenKey, token);
      await _storage.write(Constants.userKey, userData);

      return User.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  // Register
  Future<User> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.post('/auth/register', data: userData);

      final token = response.data['token'];
      final user = response.data['user'];

      // Save token and user data
      await _storage.write(Constants.tokenKey, token);
      await _storage.write(Constants.userKey, user);

      return User.fromJson(user);
    } catch (e) {
      rethrow;
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _apiService.post('/auth/logout');
    } catch (e) {
      // Even if the API call fails, we still want to clear local storage
    } finally {
      await _storage.remove(Constants.tokenKey);
      await _storage.remove(Constants.userKey);
    }
  }

  // Forgot password
  Future<void> forgotPassword(String email) async {
    try {
      await _apiService.post('/auth/forgot-password', data: {
        'email': email,
      });
    } catch (e) {
      rethrow;
    }
  }

  // Reset password
  Future<void> resetPassword(String token, String password) async {
    try {
      await _apiService.post('/auth/reset-password', data: {
        'token': token,
        'password': password,
      });
    } catch (e) {
      rethrow;
    }
  }

  // Change password
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      await _apiService.post('/auth/change-password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
    } catch (e) {
      rethrow;
    }
  }
}

