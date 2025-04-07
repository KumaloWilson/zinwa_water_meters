import 'package:get/get.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/user_service.dart';
import '../services/property_service.dart';
import '../services/meter_reading_service.dart';
import '../services/payment_service.dart';
import '../services/token_service.dart';
import '../services/notification_service.dart';

class DependencyInjection {
  static Future<void> init() async {
    // Core services
    Get.lazyPut<ApiService>(() => ApiService(), fenix: true);
    
    // Feature services
    Get.lazyPut<AuthService>(() => AuthService(), fenix: true);
    Get.lazyPut<UserService>(() => UserService(), fenix: true);
    Get.lazyPut<PropertyService>(() => PropertyService(), fenix: true);
    Get.lazyPut<MeterReadingService>(() => MeterReadingService(), fenix: true);
    Get.lazyPut<PaymentService>(() => PaymentService(), fenix: true);
    Get.lazyPut<TokenService>(() => TokenService(), fenix: true);
    Get.lazyPut<NotificationService>(() => NotificationService(), fenix: true);
  }
}

