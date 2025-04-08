import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/rate_model.dart';
import 'package:zinwa_mobile_app/services/payment_service.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/services/token_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import '../../../routes/app_routes.dart';
import '../../../utils/logs.dart';

class PaymentController extends GetxController {
  final PropertyService _propertyService = Get.find<PropertyService>();
  final TokenService _tokenService = Get.find<TokenService>();
  final PaymentService _paymentService = Get.find<PaymentService>();

  // Property ID
  late final String propertyId;

  // Property data
  final Rx<Property?> property = Rx<Property?>(null);

  // Rate data
  final Rx<Rate?> rate = Rx<Rate?>(null);

  // Form key
  final formKey = GlobalKey<FormState>();

  // Form controllers
  final amountController = TextEditingController();

  // Calculated units
  final RxDouble calculatedUnits = 0.0.obs;

  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isProcessing = false.obs;

  // Payment polling variables
  Timer? _pollingTimer;
  final RxBool isPolling = false.obs;
  final RxString paymentStatus = "".obs;
  final int maxPollAttempts = 20; // Maximum number of polling attempts
  int pollAttempts = 0;
  final int pollIntervalSeconds = 3; // Seconds between polls

  @override
  void onInit() {
    super.onInit();

    // Get property ID from route parameters
    propertyId = Get.parameters['propertyId'].toString();

    // Load property data
    loadPropertyData();

    // Add listener to amount controller
    amountController.addListener(_calculateUnits);
  }

  @override
  void onClose() {
    amountController.removeListener(_calculateUnits);
    amountController.dispose();
    _stopPolling(); // Ensure polling stops when controller is closed
    super.onClose();
  }

  // Load property data
  Future<void> loadPropertyData() async {
    try {
      isLoading.value = true;

      // Load property details
      final propertyData = await _propertyService.getPropertyById(propertyId);
      property.value = propertyData;

      // Load rate for property type
      final rateData = await _propertyService.getPropertyRate(property.value!.propertyType);
      rate.value = rateData;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load property details');
    } finally {
      isLoading.value = false;
    }
  }

  // Calculate units based on amount
  void _calculateUnits() {
    if (amountController.text.isEmpty || rate.value == null) {
      calculatedUnits.value = 0.0;
      return;
    }

    try {
      final amount = double.parse(amountController.text);
      final rateValue = rate.value!;

      // Apply fixed charge if any
      double amountAfterFixedCharge = amount;
      if (rateValue.fixedCharge > 0) {
        amountAfterFixedCharge = amount - rateValue.fixedCharge;
      }

      // Calculate units
      if (amountAfterFixedCharge <= 0) {
        calculatedUnits.value = 0.0;
      } else {
        calculatedUnits.value = amountAfterFixedCharge / rateValue.ratePerUnit;
      }
    } catch (e) {
      calculatedUnits.value = 0.0;
    }
  }

  // Process payment
  Future<void> processPayment() async {
    if (formKey.currentState!.validate()) {
      try {
        isProcessing.value = true;

        // Process payment
        final result = await _tokenService.purchaseToken(
            amount: double.parse(amountController.text),
            propertyId: propertyId
        );

        // Check if payment needs redirect
        if (result.redirectUrl.isNotEmpty) {
          // Navigate to the WebView for payment
          await Get.toNamed(
              AppRoutes.PAYNOWWEBVIEW,
              arguments: result
          );

          if (result.pollUrl != null && result.pollUrl.isNotEmpty) {
            _startPolling(result.pollUrl);
          }

        }

        // Show message
        UIHelpers.showSuccessSnackbar(
          'Payment Initiated',
          'Processing your payment...',
        );
      } catch (e) {
        DevLogs.logError('Payment processing error: ${e.toString()}');
        UIHelpers.showErrorSnackbar('Error', 'Failed to process payment');
        isProcessing.value = false;
      }
    }
  }

  // Start polling for payment status
  void _startPolling(String pollUrl) {
    if (_pollingTimer != null) {
      _stopPolling();
    }

    DevLogs.logInfo('Starting payment status polling');
    isPolling.value = true;
    pollAttempts = 0;
    paymentStatus.value = "pending";

    _pollingTimer = Timer.periodic(
        Duration(seconds: pollIntervalSeconds),
            (timer) => _checkPaymentStatus(pollUrl, timer)
    );
  }

  // Stop polling
  void _stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    isPolling.value = false;
  }

  // Check payment status
  Future<void> _checkPaymentStatus(String pollUrl, Timer timer) async {
    if (pollAttempts >= maxPollAttempts) {
      DevLogs.logWarning('Maximum poll attempts reached');
      _stopPolling();
      _handlePaymentTimeout();
      return;
    }

    pollAttempts++;
    DevLogs.logInfo('Checking payment status (attempt $pollAttempts)');

    try {
      final status = await _paymentService.checkPaymentStatus(pollUrl);
      paymentStatus.value = status;
      DevLogs.logInfo('Payment status: $status');

      // If status is no longer pending, stop polling and handle the result
      if (status.toLowerCase() != "pending") {
        _stopPolling();
        _handlePaymentResult(status);
      }
    } catch (e) {
      DevLogs.logError('Error checking payment status: ${e.toString()}');
      if (pollAttempts >= maxPollAttempts / 2) {
        UIHelpers.showErrorSnackbar(
            'Status Check Error',
            'Error checking payment status. Still trying...',
        );
      }
    }
  }

  // Handle payment result based on status
  void _handlePaymentResult(String status) {
    isProcessing.value = false;

    switch (status.toLowerCase()) {
      case "paid":
      case "confirmed":
      case "success":
        Get.offNamed(AppRoutes.PAYMENT_SUCCESS,);
        break;

      case "cancelled":
      case "failed":
      case "error":
        Get.offNamed(AppRoutes.PAYMENT_FAILURE, parameters: {
          'reason': 'Payment was not completed',
          'propertyId': propertyId
        });
        break;

      default:
      // For any other status, treat as failure
        Get.offNamed(AppRoutes.PAYMENT_FAILURE, parameters: {
          'reason': 'Payment status: $status',
          'propertyId': propertyId
        });
        break;
    }
  }

  // Handle payment timeout
  void _handlePaymentTimeout() {
    isProcessing.value = false;

    Get.offNamed(AppRoutes.PAYMENT_FAILURE, parameters: {
      'reason': 'Payment verification timed out',
      'propertyId': propertyId
    });

    UIHelpers.showErrorSnackbar(
        'Payment Timeout',
        'The payment verification process timed out. Please check your account to confirm if the payment was successful.'
    );
  }
}