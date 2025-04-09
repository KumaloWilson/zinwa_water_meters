import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/token_model.dart';
import 'package:zinwa_mobile_app/modules/payment/views/failure_screen.dart';
import 'package:zinwa_mobile_app/modules/payment/views/paynow_webview.dart';
import 'package:zinwa_mobile_app/modules/payment/views/success_screen.dart';
import '../modules/auth/bindings/auth_binding.dart';
import '../modules/auth/views/forgot_password.dart';
import '../modules/auth/views/login_view.dart';
import '../modules/auth/views/register_view.dart';
import '../modules/dashboard/bindings/dashboard_binding.dart';
import '../modules/dashboard/views/dashboard_view.dart';
import '../modules/home/bindings/home_binding.dart';
import '../modules/home/views/home_view.dart';
import '../modules/meter_reading/bindings/meter_reading_binding.dart';
import '../modules/meter_reading/views/meter_reading_view.dart';
import '../modules/notifications/bindings/notification_binding.dart';
import '../modules/notifications/views/notification_view.dart';
import '../modules/payment/bindings/payment_binding.dart';
import '../modules/payment/views/payment_history_view.dart';
import '../modules/payment/views/payment_view.dart';
import '../modules/profile/bindings/profile_binding.dart';
import '../modules/profile/views/profile_view.dart';
import '../modules/property/bindings/property_binding.dart';
import '../modules/property/views/property_detail_view.dart';
import '../modules/property/views/property_list_view.dart';
import '../modules/splash/bindings/splash_binding.dart';
import '../modules/splash/views/splash_view.dart';
import '../modules/token/bindings/token_binding.dart';
import '../modules/token/views/token_detail_view.dart';
import '../modules/token/views/token_list_view.dart';
import 'app_routes.dart';

class AppPages {
  static const INITIAL = AppRoutes.SPLASH;

  static final routes = [
    GetPage(
      name: AppRoutes.SPLASH,
      page: () => const SplashView(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: AppRoutes.LOGIN,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.REGISTER,
      page: () => RegisterView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.FORGOT_PASSWORD,
      page: () => const ForgotPasswordView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: AppRoutes.DASHBOARD,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
    ),
    GetPage(
      name: AppRoutes.PROPERTY_LIST,
      page: () => const PropertyListView(),
      binding: PropertyBinding(),
    ),
    GetPage(
      name: AppRoutes.PROPERTY_DETAIL,
      page: () => const PropertyDetailView(),
      binding: PropertyBinding(),
    ),
    GetPage(
      name: AppRoutes.METER_READING,
      page: () => const MeterReadingView(),
      binding: MeterReadingBinding(),
    ),
    GetPage(
      name: AppRoutes.PAYMENT,
      page: () => const PaymentView(),
      binding: PaymentBinding(),
    ),
    GetPage(
      name: AppRoutes.PAYNOWWEBVIEW,
      page: () {
        final TokenPurchaseResponse purchaseResponse = Get.arguments;
        return PaymentWebViewScreen(purchaseResponse: purchaseResponse);
      },
      binding: PaymentBinding(),
    ),
    GetPage(
      name: AppRoutes.PAYMENT_SUCCESS,
      page: () {
        final TokenPurchaseResponse? purchaseResponse = Get.arguments;
        return SuccessScreen(purchaseResponse: purchaseResponse!);
      },
      binding: PaymentBinding(),
    ),
    GetPage(
      name: AppRoutes.PAYMENT_FAILURE,
      page: () {
        final String reason = Get.parameters['reason'] ?? 'Payment failed';
        final String propertyId = Get.parameters['propertyId'] ?? '';
        return FailureScreen(reason: reason, propertyId: propertyId);
      },
      binding: PaymentBinding(),
    ),
    GetPage(
      name: AppRoutes.PAYMENT_HISTORY,
      page: () => const PaymentHistoryView(),
      binding: PaymentBinding(),
    ),
    GetPage(
      name: AppRoutes.TOKEN_LIST,
      page: () => const TokenListView(),
      binding: TokenBinding(),
    ),
    GetPage(
      name: AppRoutes.TOKEN_DETAIL,
      page: () => const TokenDetailView(),
      binding: TokenBinding(),
    ),
    GetPage(
      name: AppRoutes.PROFILE,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
    ),
    GetPage(
      name: AppRoutes.NOTIFICATIONS,
      page: () => const NotificationView(),
      binding: NotificationBinding(),
    ),
  ];
}
