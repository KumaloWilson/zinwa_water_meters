import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/notification_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

class NotificationService {
  final ApiService _apiService = Get.find<ApiService>();

  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await _apiService.get('/notifications');
      final List<dynamic> data = response.data['data'];
      return data.map((json) => NotificationModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Failed to get notifications: $e';
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiService.patch('/notifications/$notificationId/read',queryParameters: {});
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Failed to mark notification as read: $e';
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiService.patch('/notifications/read-all', queryParameters: {});
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Failed to mark all notifications as read: $e';
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      if (e.response!.data != null && e.response!.data['message'] != null) {
        return e.response!.data['message'];
      }
      return 'Error ${e.response!.statusCode}: ${e.response!.statusMessage}';
    }
    return e.message ?? 'Unknown error occurred';
  }
}

