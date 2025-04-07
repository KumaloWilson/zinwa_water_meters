import 'package:get/get.dart';
import '../controllers/property_controller.dart';
import '../controllers/property_detail_controller.dart';

class PropertyBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PropertyController>(() => PropertyController());
    
    // Only create the detail controller if we have a property ID
    final propertyId = Get.parameters['id'];
    if (propertyId != null) {
      Get.lazyPut<PropertyDetailController>(() => PropertyDetailController());
    }
  }
}

