import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:zinwa_mobile_app/models/notification_model.dart';
import 'package:zinwa_mobile_app/modules/notifications/controllers/notification_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/widgets/custom_button.dart';
import 'package:zinwa_mobile_app/widgets/empty_state.dart';

import '../../../widgets/notification_card.dart';

class NotificationView extends GetView<NotificationController> {
  const NotificationView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          Obx(() => controller.hasUnreadNotifications.value
              ? TextButton(
            onPressed: controller.markAllAsRead,
            child: const Text('Mark all as read'),
          )
              : const SizedBox.shrink()),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.error.value.isNotEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Error: ${controller.error.value}',
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                CustomButton(
                  text: 'Retry',
                  onPressed: controller.fetchNotifications,
                  width: 120,
                ),
              ],
            ),
          );
        }

        if (controller.notifications.isEmpty) {
          return EmptyState(
            icon: Icons.notifications_off_outlined,
            title: 'No Notifications',
            message: 'You don\'t have any notifications at the moment.',
            buttonText: 'Refresh',
            onButtonPressed: controller.fetchNotifications,
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            await controller.fetchNotifications();
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.notifications.length,
            itemBuilder: (context, index) {
              final notification = controller.notifications[index];
              return NotificationCard(
                notification: notification,
                onTap: () => controller.viewNotificationDetails(notification),
                onMarkAsRead: () => controller.markAsRead(notification.id),
              );
            },
          ),
        );
      }),
    );
  }
}
