import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:zinwa_mobile_app/models/meter_reading_model.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/services/meter_reading_service.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class MeterReadingController extends GetxController {
  final PropertyService _propertyService = Get.find<PropertyService>();
  final MeterReadingService _meterReadingService = Get.find<MeterReadingService>();
  
  // Property ID
  late final String propertyId;
  
  // Property data
  final Rx<Property?> property = Rx<Property?>(null);
  
  // Last meter reading
  final Rx<MeterReading?> lastReading = Rx<MeterReading?>(null);
  
  // Form key
  final formKey = GlobalKey<FormState>();
  
  // Form controllers
  final readingController = TextEditingController();
  final notesController = TextEditingController();
  
  // Reading date
  final Rx<DateTime> readingDate = DateTime.now().obs;
  
  // Image
  final RxString imagePath = ''.obs;
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isSubmitting = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    
    // Get property ID from route parameters
    propertyId = Get.parameters['propertyId'].toString();
    
    // Load property data
    loadPropertyData();
  }
  
  @override
  void onClose() {
    readingController.dispose();
    notesController.dispose();
    super.onClose();
  }
  
  // Load property data
  Future<void> loadPropertyData() async {
    try {
      isLoading.value = true;
      
      // Load property details
      final propertyData = await _propertyService.getPropertyById(propertyId);
      property.value = propertyData;
      
      // Load last meter reading
      final readings = await _meterReadingService.getPropertyMeterReadings(propertyId);
      if (readings.isNotEmpty) {
        // Sort by date (newest first)
        readings.sort((a, b) => b.readingDate.compareTo(a.readingDate));
        lastReading.value = readings.first;
      }
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load property details');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Pick image
  Future<void> pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        imageQuality: 70,
      );
      
      if (pickedFile != null) {
        imagePath.value = pickedFile.path;
      }
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to pick image');
    }
  }
  
  // Remove image
  void removeImage() {
    imagePath.value = '';
  }
  
  // Select date
  Future<void> selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: Get.context!,
      initialDate: readingDate.value,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    
    if (picked != null && picked != readingDate.value) {
      readingDate.value = picked;
    }
  }
  
  // Submit reading
  Future<void> submitReading() async {
    if (formKey.currentState!.validate()) {
      try {
        isSubmitting.value = true;
        
        // Prepare reading data
        final readingData = {
          'propertyId': propertyId,
          'reading': double.parse(readingController.text),
          'readingDate': readingDate.value.toIso8601String(),
          'notes': notesController.text,
        };
        
        // Submit reading
        await _meterReadingService.submitMeterReading(readingData, imagePath.value.isNotEmpty ? imagePath.value : null);
        
        // Show success message
        UIHelpers.showSuccessSnackbar(
          'Success',
          'Meter reading submitted successfully',
        );
        
        // Navigate back
        Get.back();
      } catch (e) {
        UIHelpers.showErrorSnackbar('Error', 'Failed to submit meter reading');
      } finally {
        isSubmitting.value = false;
      }
    }
  }
}

