import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/notification_model.dart';
import 'package:zinwa_mobile_app/services/notification_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class NotificationController extends GetxController {
  final NotificationService _notificationService = Get.find<NotificationService>();

  // Notifications list
  final RxList<NotificationModel> notifications = <NotificationModel>[].obs;

  // Loading and error states
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;

  // Unread notifications flag
  final RxBool hasUnreadNotifications = false.obs;

  // Unread count for badge
  final RxInt unreadCount = 0.obs;

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();

    // Set up periodic refresh (every 5 minutes)
    ever(unreadCount, (_) => _updateAppBadge());

    // Schedule periodic refresh
    _schedulePeriodicRefresh();
  }

  Future<void> fetchNotifications() async {
    isLoading.value = true;
    error.value = '';

    try {
      final result = await _notificationService.getNotifications();
      notifications.value = result;
      _updateUnreadStatus();
    } catch (e) {
      error.value = e.toString();
      UIHelpers.showErrorSnackbar('Failed to load notifications', e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void _updateUnreadStatus() {
    // Update both the hasUnreadNotifications flag and the unreadCount
    final unreadNotifications = notifications.where((notification) => !notification.isRead);
    hasUnreadNotifications.value = unreadNotifications.isNotEmpty;
    unreadCount.value = unreadNotifications.length;
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);

      // Update local state
      final index = notifications.indexWhere((notification) => notification.id == notificationId);
      if (index != -1) {
        final updatedNotification = notifications[index].copyWith(isRead: true);
        notifications[index] = updatedNotification;
        _updateUnreadStatus();
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
      _updateUnreadStatus();

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

  // Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _notificationService.deleteNotification(notificationId);

      // Remove from local list
      notifications.removeWhere((n) => n.id == notificationId);

      // Update unread status
      _updateUnreadStatus();

      UIHelpers.showSuccessSnackbar('Success', 'Notification deleted');
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to delete notification');
    }
  }

  // Update app badge (if supported)
  void _updateAppBadge() {
    // This would integrate with platform-specific badge APIs
    // For example, using flutter_app_badger package
    // AppBadger.updateBadgeCount(unreadCount.value);
  }

  // Schedule periodic refresh
  void _schedulePeriodicRefresh() {
    // Refresh every 5 minutes
    Future.delayed(const Duration(minutes: 5), () {
      fetchNotifications();
      _schedulePeriodicRefresh();
    });
  }

  // Get formatted time
  String getFormattedTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      // More than a week ago, show the date
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } else if (difference.inDays > 0) {
      // Days ago
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      // Hours ago
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      // Minutes ago
      return '${difference.inMinutes}m ago';
    } else {
      // Just now
      return 'Just now';
    }
  }
}
