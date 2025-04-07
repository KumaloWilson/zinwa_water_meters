import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/token_model.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/services/token_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class TokenDetailController extends GetxController {
  final TokenService _tokenService = Get.find<TokenService>();
  final PropertyService _propertyService = Get.find<PropertyService>();
  
  // Token ID
  late final String tokenId;
  
  // Token data
  final Rx<Token?> token = Rx<Token?>(null);
  
  // Property data
  final Rx<Property?> property = Rx<Property?>(null);
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    
    // Get token ID from route parameters
    tokenId = Get.parameters['id'].toString();
    
    // Load token data
    loadTokenData();
  }
  
  // Load token data
  Future<void> loadTokenData() async {
    try {
      isLoading.value = true;
      
      // Load token details
      final tokenData = await _tokenService.getTokenById(tokenId);
      token.value = tokenData;
      
      // Load property details
      final propertyData = await _propertyService.getPropertyById(tokenData.propertyId);
      property.value = propertyData;
        } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load token details');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Refresh token data
  Future<void> refreshTokenData() async {
    try {
      isRefreshing.value = true;
      
      // Reload token details
      final tokenData = await _tokenService.getTokenById(tokenId);
      token.value = tokenData;
      
      // Reload property details
      final propertyData = await _propertyService.getPropertyById(tokenData.propertyId);
      property.value = propertyData;
        } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to refresh token details');
    } finally {
      isRefreshing.value = false;
    }
  }
  
  // Copy token to clipboard
  void copyTokenToClipboard() {
    if (token.value != null) {
      Clipboard.setData(ClipboardData(text: token.value!.tokenNumber));
      UIHelpers.showSuccessSnackbar('Copied', 'Token copied to clipboard');
    }
  }
}

