import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:zinwa_mobile_app/routes/app_pages.dart';
import 'package:zinwa_mobile_app/services/auth_service.dart';
import 'package:zinwa_mobile_app/utils/constants.dart';

import '../../../routes/app_routes.dart';

class SplashController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final GetStorage _storage = Get.find<GetStorage>();

  @override
  void onInit() {
    super.onInit();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    await Future.delayed(const Duration(seconds: 2)); // Splash screen delay

    if (_authService.isLoggedIn) {
      // Check if token is valid
      try {
        await _authService.getCurrentUser();
        Get.offAllNamed(AppRoutes.HOME);
      } catch (e) {
        // Token is invalid, clear storage and go to login
        await _storage.remove(Constants.tokenKey);
        await _storage.remove(Constants.userKey);
        Get.offAllNamed(AppRoutes.LOGIN);
      }
    } else {
      Get.offAllNamed(AppRoutes.LOGIN);
    }
  }
}

