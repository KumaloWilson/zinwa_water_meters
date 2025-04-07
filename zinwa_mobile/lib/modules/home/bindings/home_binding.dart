import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:zinwa_mobile_app/modules/home/controllers/home_controller.dart';
import 'package:zinwa_mobile_app/modules/notifications/controllers/notification_controller.dart';
import 'package:zinwa_mobile_app/modules/profile/controllers/profile_controller.dart';
import 'package:zinwa_mobile_app/modules/property/controllers/property_controller.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(HomeController());
    Get.put(DashboardController());
    Get.put(PropertyController());
    Get.put(NotificationController());
    Get.put(ProfileController());
  }
}

