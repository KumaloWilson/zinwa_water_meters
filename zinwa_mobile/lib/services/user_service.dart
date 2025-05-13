import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/user_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

import '../utils/logs.dart';

class UserService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  // Get user profile
  Future<User> getUserProfile() async {
    try {
      final response = await _apiService.get('/auth/me');
      return User.fromJson(response.data['user']);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Update user profile
  Future<User> updateUserProfile({required Map<String, dynamic> userData, required String uid}) async {
    try {
      final response = await _apiService.put('/users/$uid', data: userData);

      return User.fromJson(response.data['user']);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Update user avatar
  Future<String> updateUserAvatar(String filePath) async {
    try {
      final formData = FormData({
        'avatar': MultipartFile(filePath, filename: filePath.split('/').last),
      });
      
      final response = await _apiService.post('/users/avatar', data: formData);
      return response.data['avatarUrl'];
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }
}

