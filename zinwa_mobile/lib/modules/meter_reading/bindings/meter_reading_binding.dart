import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/meter_reading/controllers/meter_reading_controller.dart';

class MeterReadingBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(MeterReadingController());
  }
}

