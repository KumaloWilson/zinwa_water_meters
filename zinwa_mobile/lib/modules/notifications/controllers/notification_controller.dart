import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/notification_model.dart';
import 'package:zinwa_mobile_app/services/notification_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class NotificationController extends GetxController {
  final NotificationService _notificationService = Get.find<NotificationService>();

  final RxList<NotificationModel> notifications = <NotificationModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;
  final RxBool hasUnreadNotifications = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    isLoading.value = true;
    error.value = '';

    try {
      final result = await _notificationService.getNotifications();
      notifications.value = result;
      _checkUnreadNotifications();
    } catch (e) {
      error.value = e.toString();
      UIHelpers.showErrorSnackbar('Failed to load notifications', e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void _checkUnreadNotifications() {
    hasUnreadNotifications.value = notifications.any((notification) => !notification.isRead);
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);

      // Update local state
      final index = notifications.indexWhere((notification) => notification.id == notificationId);
      if (index != -1) {
        final updatedNotification = notifications[index].copyWith(isRead: true);
        notifications[index] = updatedNotification;
        _checkUnreadNotifications();
      }

      UIHelpers.showSuccessSnackbar('Success', 'Notification marked as read');
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to mark notification as read');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();

      // Update local state
      final updatedNotifications = notifications.map((notification) =>
          notification.copyWith(isRead: true)
      ).toList();

      notifications.value = updatedNotifications;
      hasUnreadNotifications.value = false;

      UIHelpers.showSuccessSnackbar('Success', 'All notifications marked as read');
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to mark all notifications as read');
    }
  }

  void viewNotificationDetails(NotificationModel notification) async {
    // If notification is not read, mark it as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type.toLowerCase()) {
      case 'payment':
        if (notification.referenceId != null) {
          Get.toNamed('/payment-history');
        }
        break;
      case 'meter_reading':
        if (notification.referenceId != null) {
          final propertyId = notification.referenceId;
          Get.toNamed('/property/$propertyId');
        }
        break;
      case 'token':
        if (notification.referenceId != null) {
          final tokenId = notification.referenceId;
          Get.toNamed('/token/$tokenId');
        }
        break;
      case 'property':
        if (notification.referenceId != null) {
          final propertyId = notification.referenceId;
          Get.toNamed('/property/$propertyId');
        }
        break;
      default:
      // Show notification details in a dialog for system notifications
        Get.dialog(
          AlertDialog(
            title: Text(notification.title),
            content: Text(notification.message),
            actions: [
              TextButton(
                onPressed: () => Get.back(),
                child: const Text('Close'),
              ),
            ],
          ),
        );
    }
  }
}

