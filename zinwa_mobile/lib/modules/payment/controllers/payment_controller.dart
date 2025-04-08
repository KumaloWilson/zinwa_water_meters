import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/rate_model.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/services/token_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../routes/app_routes.dart';

class PaymentController extends GetxController {
  final PropertyService _propertyService = Get.find<PropertyService>();
  final TokenService _tokenService = Get.find<TokenService>();
  
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
          Get.toNamed(AppRoutes.PAYNOWWEBVIEW, arguments: result.redirectUrl);
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

