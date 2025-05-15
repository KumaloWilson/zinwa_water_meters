import 'dart:convert';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:zinwa_mobile_app/models/user_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';
import 'package:zinwa_mobile_app/utils/constants.dart';
import '../utils/logs.dart';

class AuthService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();
  final GetStorage _storage = Get.find<GetStorage>();

  // Check if user is logged in
  bool get isLoggedIn => _storage.hasData(Constants.tokenKey);

  // Get current user
  User? get currentUser {
    final userData = _storage.read(Constants.userKey);
    if (userData != null) {
      try {
        // Handle case where userData might be stored as a string
        if (userData is String) {
          return User.fromJson(jsonDecode(userData));
        }
        return User.fromJson(userData);
      } catch (e) {
        DevLogs.logError("Error parsing user data: $e");
        return null;
      }
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
      DevLogs.logError(e.toString());
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
      // Properly encode the data as JSON
      final response = await _apiService.post('/auth/login', data: jsonEncode({
        'email': email,
        'password': password,
      }));

      final token = response.data['token'];
      final userData = response.data['user'];

      // Save token and user data
      await _storage.write(Constants.tokenKey, token);
      await _storage.write(Constants.userKey, userData);

      return User.fromJson(userData);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Register function
  Future<User> register(Map<String, dynamic> userData) async {
    try {
      // Convert userData to a proper JSON string
      DevLogs.logInfo("Sending registration data: ${jsonEncode(userData)}");

      final response = await _apiService.post('/auth/register', data: jsonEncode(userData));

      DevLogs.logInfo("Registration successful: ${response.data}");

      final token = response.data['token'];
      final user = response.data['user'];

      // Save token and user data
      await _storage.write(Constants.tokenKey, token);
      await _storage.write(Constants.userKey, user);

      return User.fromJson(user);
    } catch (e) {
      DevLogs.logError("Registration failed: ${e.toString()}");
      throw Exception("Error registering user");
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _apiService.post('/auth/logout');
    } catch (e) {
      DevLogs.logError(e.toString());
      // Even if the API call fails, we still want to clear local storage
    } finally {
      await _storage.remove(Constants.tokenKey);
      await _storage.remove(Constants.userKey);
    }
  }

  // Forgot password
  Future<void> forgotPassword(String email) async {
    try {
      await _apiService.post('/auth/forgot-password', data: jsonEncode({
        'email': email,
      }));
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Reset password
  Future<void> resetPassword(String token, String password) async {
    try {
      await _apiService.post('/auth/reset-password', data: jsonEncode({
        'token': token,
        'password': password,
      }));
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Change password
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      await _apiService.post('/auth/change-password', data: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }));
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }
}