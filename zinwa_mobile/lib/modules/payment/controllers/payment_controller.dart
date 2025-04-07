import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/rate_model.dart';
import 'package:zinwa_mobile_app/services/payment_service.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/utils/constants.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentController extends GetxController {
  final PropertyService _propertyService = Get.find<PropertyService>();
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
  
  // Selected payment method
  final RxString selectedPaymentMethod = Constants.paymentMethods.first.obs;
  
  // Calculated units
  final RxDouble calculatedUnits = 0.0.obs;
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isProcessing = false.obs;
  
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
      final rateData = await _propertyService.getPropertyRate(propertyId);
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
  
  // Change payment method
  void changePaymentMethod(String method) {
    selectedPaymentMethod.value = method;
  }
  
  // Process payment
  Future<void> processPayment() async {
    if (formKey.currentState!.validate()) {
      try {
        isProcessing.value = true;
        
        // Prepare payment data
        final paymentData = {
          'propertyId': propertyId,
          'amount': double.parse(amountController.text),
          'paymentMethod': selectedPaymentMethod.value,
        };
        
        // Process payment
        final result = await _paymentService.createPayment(paymentData);
        
        // Check if payment needs redirect
        if (result['redirectUrl'] != null) {
          // Launch payment URL
          final url = Uri.parse(result['redirectUrl']);
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          } else {
            throw 'Could not launch payment URL';
          }
        }
        
        // Show success message
        UIHelpers.showSuccessSnackbar(
          'Payment Initiated',
          'Please complete the payment process',
        );
        
        // Navigate back
        Get.back();
      } catch (e) {
        UIHelpers.showErrorSnackbar('Error', 'Failed to process payment');
      } finally {
        isProcessing.value = false;
      }
    }
  }
}

