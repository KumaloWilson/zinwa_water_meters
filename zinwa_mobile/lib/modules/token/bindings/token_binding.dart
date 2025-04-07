import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/token/controllers/token_controller.dart';
import 'package:zinwa_mobile_app/modules/token/controllers/token_detail_controller.dart';

class TokenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TokenController>(() => TokenController());
    Get.lazyPut<TokenDetailController>(() => TokenDetailController());
  }
}

