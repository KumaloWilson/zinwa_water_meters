import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/notification_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

import '../utils/logs.dart';
import 'auth_service.dart';

class NotificationService {
  final ApiService _apiService = Get.find<ApiService>();
  final AuthService _authService = Get.find<AuthService>();


  Future<List<NotificationModel>> getNotifications() async {
    final String userId = _authService.currentUser?.id ?? '';

    try {
      final response = await _apiService.get('/notifications/user/$userId');
      final List<dynamic> data = response.data['notifications'];
      return data.map((json) => NotificationModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      DevLogs.logError(e.toString());
      throw 'Failed to get notifications: $e';
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiService.patch('/notifications/$notificationId/read',queryParameters: {});
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      DevLogs.logError(e.toString());
      throw 'Failed to mark notification as read: $e';
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _apiService.delete('/notifications/$notificationId');
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      DevLogs.logError(e.toString());
      throw 'Failed to delete notification: $e';
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiService.patch('/notifications/read-all', queryParameters: {});
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      DevLogs.logError(e.toString());
      throw 'Failed to mark all notifications as read: $e';
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      if (e.response!.data != null && e.response!.data['message'] != null) {
        return e.response!.data['message'];
      }
      DevLogs.logError(e.toString());
      return 'Error ${e.response!.statusCode}: ${e.response!.statusMessage}';
    }
    DevLogs.logError(e.toString());
    return e.message ?? 'Unknown error occurred';
  }
}

