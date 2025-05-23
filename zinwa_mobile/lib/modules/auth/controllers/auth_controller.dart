import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:logger/logger.dart';
import 'package:zinwa_mobile_app/models/user_model.dart';
import 'package:zinwa_mobile_app/routes/app_pages.dart';
import 'package:zinwa_mobile_app/services/auth_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

import '../../../routes/app_routes.dart';

class AuthController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();

  // Form controllers
  final loginFormKey = GlobalKey<FormState>();
  final registerFormKey = GlobalKey<FormState>();
  final forgotPasswordFormKey = GlobalKey<FormState>();

  // Login form
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  // Register form
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final registerEmailController = TextEditingController();
  final registerPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final phoneController = TextEditingController();

  // Forgot password form
  final forgotPasswordEmailController = TextEditingController();

  // Loading states
  final RxBool isLoading = false.obs;
  final RxBool isRegistering = false.obs;
  final RxBool isSendingResetEmail = false.obs;
  final RxBool resetEmailSent = false.obs;

  // Password visibility
  final RxBool obscurePassword = true.obs;
  final RxBool obscureRegisterPassword = true.obs;
  final RxBool obscureConfirmPassword = true.obs;

  @override
  void onClose() {
    // Dispose controllers
    // emailController.dispose();
    // passwordController.dispose();
    // firstNameController.dispose();
    // lastNameController.dispose();
    // registerEmailController.dispose();
    // registerPasswordController.dispose();
    // confirmPasswordController.dispose();
    // phoneController.dispose();
    // forgotPasswordEmailController.dispose();
    super.onClose();
  }

  // Toggle password visibility
  void togglePasswordVisibility() {
    obscurePassword.value = !obscurePassword.value;
  }

  void toggleRegisterPasswordVisibility() {
    obscureRegisterPassword.value = !obscureRegisterPassword.value;
  }

  void toggleConfirmPasswordVisibility() {
    obscureConfirmPassword.value = !obscureConfirmPassword.value;
  }

  // Reset forgot password form state
  void resetForgotPasswordForm() {
    resetEmailSent.value = false;
  }

  // Login function
  Future<void> login() async {
    if (loginFormKey.currentState!.validate()) {
      try {
        isLoading.value = true;

        await _authService.login(
          emailController.text.trim(),
          passwordController.text,
        );

        // Don't clear form here - navigate first
        // Navigate to home
        Get.offAllNamed(AppRoutes.HOME);
      } catch (e) {
        UIHelpers.showErrorSnackbar('Login Failed', e.toString());
      } finally {
        isLoading.value = false;
      }
    }
  }

  // Register function
  Future<void> register() async {
    if (registerFormKey.currentState!.validate()) {
      try {
        isRegistering.value = true;

        final userData = {
          'firstName': firstNameController.text.trim(),
          'lastName': lastNameController.text.trim(),
          'email': registerEmailController.text.trim(),
          'password': registerPasswordController.text.trim(),
          'phoneNumber': phoneController.text.trim(),
          'role': 'customer',
        };

        await _authService.register(userData);

        // Don't clear form here, let the user be redirected first
        // Navigate to home
        Get.offAllNamed(AppRoutes.HOME);
      } catch (e) {
        UIHelpers.showErrorSnackbar('Registration Failed', e.toString());
      } finally {
        isRegistering.value = false;
      }
    }
  }

  // Forgot password function
  Future<void> forgotPassword() async {
    if (forgotPasswordFormKey.currentState!.validate()) {
      try {
        isSendingResetEmail.value = true;

        await _authService.forgotPassword(
          forgotPasswordEmailController.text.trim(),
        );

        // Mark as sent - don't navigate away yet
        resetEmailSent.value = true;

      } catch (e) {
        UIHelpers.showErrorSnackbar('Password Reset Failed', e.toString());
      } finally {
        isSendingResetEmail.value = false;
      }
    }
  }
}