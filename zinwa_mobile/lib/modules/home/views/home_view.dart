import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/dashboard/views/dashboard_view.dart';
import 'package:zinwa_mobile_app/modules/home/controllers/home_controller.dart';
import 'package:zinwa_mobile_app/modules/notifications/controllers/notification_controller.dart';
import 'package:zinwa_mobile_app/modules/payment/views/payment_history_view.dart';
import 'package:zinwa_mobile_app/modules/profile/views/profile_view.dart';
import 'package:zinwa_mobile_app/modules/property/views/property_list_view.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Get the notification controller to access unread count
    final notificationController = Get.find<NotificationController>();

    return Scaffold(
      body: Obx(() {
        switch (controller.currentIndex.value) {
          case 0:
            return const DashboardView();
          case 1:
            return const PropertyListView();
          case 2:
            return const PaymentHistoryView();
          case 3:
            return const ProfileView();
          default:
            return const DashboardView();
        }
      }),
      bottomNavigationBar: Obx(() {
        return BottomNavigationBar(
          currentIndex: controller.currentIndex.value,
          onTap: controller.changeTab,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: Colors.grey,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Properties',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.payment_outlined),
              activeIcon: Icon(Icons.payment),
              label: 'Payments',
            ),
            BottomNavigationBarItem(
              icon: Stack(
                children: [
                  const Icon(Icons.person_outline),
                  Obx(() {
                    if (notificationController.unreadCount.value > 0) {
                      return Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 12,
                            minHeight: 12,
                          ),
                          child: Text(
                            notificationController.unreadCount.value > 9
                                ? '9+'
                                : '${notificationController.unreadCount.value}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    } else {
                      return const SizedBox.shrink();
                    }
                  }),
                ],
              ),
              activeIcon: Stack(
                children: [
                  const Icon(Icons.person),
                  Obx(() {
                    if (notificationController.unreadCount.value > 0) {
                      return Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 12,
                            minHeight: 12,
                          ),
                          child: Text(
                            notificationController.unreadCount.value > 9
                                ? '9+'
                                : '${notificationController.unreadCount.value}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    } else {
                      return const SizedBox.shrink();
                    }
                  }),
                ],
              ),
              label: 'Profile',
            ),
          ],
        );
      }),
    );
  }
}
