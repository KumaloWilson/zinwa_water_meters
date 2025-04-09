import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/routes/app_routes.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/widgets/custom_button.dart';

class FailureScreen extends StatelessWidget {
  final String reason;
  final String propertyId;

  const FailureScreen({
    super.key,
    required this.reason,
    required this.propertyId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Icon
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: .1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.error_outline,
                    size: 60,
                    color: Colors.red,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              // Title
              const Text(
                'Payment Failed',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              // Description
              Text(
                reason,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // Try again button
              CustomButton(
                text: 'Try Again',
                onPressed: () {
                  Get.offNamed(
                    AppRoutes.PAYMENT,
                    parameters: {'propertyId': propertyId},
                  );
                },
              ),
              const SizedBox(height: 16),
              // Back to home button
              OutlinedButton(
                onPressed: () => Get.offAllNamed(AppRoutes.HOME),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: BorderSide(color: AppColors.primary),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  'Back to Home',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Contact support
              Center(
                child: TextButton(
                  onPressed: () {
                    // TODO: Implement contact support functionality
                    Get.snackbar(
                      'Contact Support',
                      'Support contact feature will be implemented soon.',
                      snackPosition: SnackPosition.BOTTOM,
                    );
                  },
                  child: const Text(
                    'Contact Support',
                    style: TextStyle(
                      color: Colors.grey,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
