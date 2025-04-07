import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/meter_reading_model.dart';
import 'package:zinwa_mobile_app/models/payment_model.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/services/meter_reading_service.dart';
import 'package:zinwa_mobile_app/services/payment_service.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class DashboardController extends GetxController {
  final PropertyService _propertyService = Get.find<PropertyService>();
  final PaymentService _paymentService = Get.find<PaymentService>();
  final MeterReadingService _meterReadingService = Get.find<MeterReadingService>();
  
  // Dashboard data
  final RxList<Property> properties = <Property>[].obs;
  final RxList<Payment> recentPayments = <Payment>[].obs;
  final RxList<MeterReading> recentReadings = <MeterReading>[].obs;
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;
  
  // Dashboard stats
  final RxDouble totalBalance = 0.0.obs;
  final RxDouble totalConsumption = 0.0.obs;
  final RxInt activeProperties = 0.obs;
  
  @override
  void onInit() {
    super.onInit();
    loadDashboardData();
  }
  
  // Load dashboard data
  Future<void> loadDashboardData() async {
    try {
      isLoading.value = true;
      
      // Load properties
      await loadProperties();
      
      // Load recent payments
      await loadRecentPayments();
      
      // Calculate stats
      calculateStats();
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load dashboard data');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Refresh dashboard data
  Future<void> refreshDashboardData() async {
    try {
      isRefreshing.value = true;
      
      // Load properties
      await loadProperties();
      
      // Load recent payments
      await loadRecentPayments();
      
      // Calculate stats
      calculateStats();
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to refresh dashboard data');
    } finally {
      isRefreshing.value = false;
    }
  }
  
  // Load properties
  Future<void> loadProperties() async {
    try {
      final propertiesList = await _propertyService.getUserProperties();
      properties.value = propertiesList;
      
      // Load recent readings for each property
      await loadRecentReadings();
    } catch (e) {
      rethrow;
    }
  }
  
  // Load recent payments
  Future<void> loadRecentPayments() async {
    try {
      final payments = await _paymentService.getUserPayments();
      // Sort by date (newest first) and take the 5 most recent
      payments.sort((a, b) => b.paymentDate.compareTo(a.paymentDate));
      recentPayments.value = payments.take(5).toList();
    } catch (e) {
      rethrow;
    }
  }
  
  // Load recent readings
  Future<void> loadRecentReadings() async {
    try {
      final List<MeterReading> allReadings = [];
      
      // Get readings for each property
      for (final property in properties) {
        final readings = await _meterReadingService.getPropertyMeterReadings(property.id);
        allReadings.addAll(readings);
      }
      
      // Sort by date (newest first) and take the 5 most recent
      allReadings.sort((a, b) => b.readingDate.compareTo(a.readingDate));
      recentReadings.value = allReadings.take(5).toList();
    } catch (e) {
      rethrow;
    }
  }
  
  // Calculate dashboard stats
  void calculateStats() {
    // Calculate total balance
    totalBalance.value = properties.fold(0, (sum, property) => sum + property.currentBalance);
    
    // Calculate total consumption
    totalConsumption.value = properties.fold(0, (sum, property) => sum + property.totalConsumption);
    
    // Count active properties
    activeProperties.value = properties.where((property) => property.isActive).length;
  }
}

