import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/dashboard/views/dashboard_view.dart';
import 'package:zinwa_mobile_app/modules/notifications/views/notification_view.dart';
import 'package:zinwa_mobile_app/modules/profile/views/profile_view.dart';
import 'package:zinwa_mobile_app/modules/property/views/property_list_view.dart';

class HomeController extends GetxController {
  // Current tab index
  final RxInt currentIndex = 0.obs;
  
  // Pages to display in bottom navigation
  final List<Widget> pages = [
    const DashboardView(),
    const PropertyListView(),
    const NotificationView(),
    const ProfileView(),
  ];
  
  // Change tab
  void changeTab(int index) {
    currentIndex.value = index;
  }
}

