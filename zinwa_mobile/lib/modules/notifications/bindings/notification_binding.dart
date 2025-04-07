import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/notifications/controllers/notification_controller.dart';

class NotificationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<NotificationController>(() => NotificationController());
  }
}

