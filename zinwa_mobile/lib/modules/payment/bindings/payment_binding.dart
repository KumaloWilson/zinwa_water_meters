import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/payment/controllers/payment_controller.dart';
import 'package:zinwa_mobile_app/modules/payment/controllers/payment_history_controller.dart';

class PaymentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PaymentController>(() => PaymentController());
    Get.lazyPut<PaymentHistoryController>(() => PaymentHistoryController());
  }
}

