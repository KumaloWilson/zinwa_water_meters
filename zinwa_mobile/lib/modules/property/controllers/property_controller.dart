import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../models/property_model.dart';
import '../../../services/property_service.dart';
import '../../../utils/ui_helpers.dart';

class PropertyController extends GetxController {
  final PropertyService _propertyService = Get.find<PropertyService>();
  
  final RxList<Property> properties = <Property>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    fetchProperties();
  }
  
  Future<void> fetchProperties() async {
    try {
      isLoading.value = true;
      final result = await _propertyService.getUserProperties();
      properties.value = result;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load properties: ${e.toString()}');
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> refreshProperties() async {
    try {
      isRefreshing.value = true;
      final result = await _propertyService.getUserProperties();
      properties.value = result;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to refresh properties: ${e.toString()}');
    } finally {
      isRefreshing.value = false;
    }
  }
  
  void navigateToPropertyDetail(String propertyId) {
    Get.toNamed('/property/$propertyId');
  }
  
  void navigateToAddMeterReading(String propertyId) {
    Get.toNamed('/meter-reading/$propertyId');
  }
  
  void navigateToPayment(String propertyId) {
    Get.toNamed('/payment/$propertyId');
  }
}

