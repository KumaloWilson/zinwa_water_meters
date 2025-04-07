import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../models/meter_reading_model.dart';
import '../../../models/payment_model.dart';
import '../../../models/property_model.dart';
import '../../../models/token_model.dart';
import '../../../services/meter_reading_service.dart';
import '../../../services/payment_service.dart';
import '../../../services/property_service.dart';
import '../../../services/token_service.dart';
import '../../../utils/ui_helpers.dart';

class PropertyDetailController extends GetxController with GetSingleTickerProviderStateMixin {
  final PropertyService _propertyService = Get.find<PropertyService>();
  final MeterReadingService _meterReadingService = Get.find<MeterReadingService>();
  final TokenService _tokenService = Get.find<TokenService>();
  final PaymentService _paymentService = Get.find<PaymentService>();

  late TabController tabController;

  final Rx<Property?> property = Rx<Property?>(null);
  final RxList<MeterReading> meterReadings = <MeterReading>[].obs;
  final RxList<Token> tokens = <Token>[].obs;
  final RxList<Payment> payments = <Payment>[].obs;

  final RxBool isLoading = false.obs;
  final RxBool isReadingsLoading = false.obs;
  final RxBool isTokensLoading = false.obs;
  final RxBool isPaymentsLoading = false.obs;

  final String propertyId = Get.parameters['id'] ?? '';

  // Getter for consumptionData
  List<Map<String, dynamic>> get consumptionData => getConsumptionData();

  // Getters to match the naming in the view
  RxBool get isLoadingReadings => isReadingsLoading;
  RxBool get isLoadingTokens => isTokensLoading;
  RxBool get isLoadingPayments => isPaymentsLoading;

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: 3, vsync: this);

    if (propertyId.isNotEmpty) {
      fetchPropertyDetails();
      fetchMeterReadings();
      fetchTokens();
      fetchPayments();
    } else {
      UIHelpers.showErrorSnackbar('Error', 'Property ID is missing');
      Get.back();
    }
  }

  @override
  void onClose() {
    tabController.dispose();
    super.onClose();
  }

  Future<void> fetchPropertyDetails() async {
    try {
      isLoading.value = true;
      final result = await _propertyService.getPropertyById(propertyId);
      property.value = result;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load property details: ${e.toString()}');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchMeterReadings() async {
    try {
      isReadingsLoading.value = true;
      final result = await _meterReadingService.getPropertyMeterReadings(propertyId);
      meterReadings.value = result;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load meter readings: ${e.toString()}');
    } finally {
      isReadingsLoading.value = false;
    }
  }

  Future<void> fetchTokens() async {
    try {
      isTokensLoading.value = true;
      final result = await _tokenService.getPropertyTokens(propertyId);
      tokens.value = result;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load tokens: ${e.toString()}');
    } finally {
      isTokensLoading.value = false;
    }
  }

  Future<void> fetchPayments() async {
    try {
      isPaymentsLoading.value = true;
      final result = await _paymentService.getPaymentsByPropertyId(propertyId);
      payments.value = result;
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load payments: ${e.toString()}');
    } finally {
      isPaymentsLoading.value = false;
    }
  }

  void navigateToAddMeterReading() {
    Get.toNamed('/meter-reading/$propertyId');
  }

  void navigateToPayment() {
    Get.toNamed('/payment/$propertyId');
  }

  void navigateToTokenDetail(String tokenId) {
    Get.toNamed('/token/$tokenId');
  }

  List<MeterReading> getRecentMeterReadings() {
    return meterReadings.take(5).toList();
  }

  List<Token> getRecentTokens() {
    return tokens.take(5).toList();
  }

  List<Payment> getRecentPayments() {
    return payments.take(5).toList();
  }

  double getLastMonthConsumption() {
    if (meterReadings.isEmpty || meterReadings.length < 2) {
      return 0.0;
    }

    // Sort readings by date
    final sortedReadings = [...meterReadings]..sort((a, b) => b.readingDate.compareTo(a.readingDate));

    if (sortedReadings.length >= 2) {
      return sortedReadings[0].reading - sortedReadings[1].reading;
    }

    return 0.0;
  }

  List<Map<String, dynamic>> getConsumptionData() {
    if (meterReadings.isEmpty) {
      return [];
    }

    // Sort readings by date
    final sortedReadings = [...meterReadings]..sort((a, b) => a.readingDate.compareTo(b.readingDate));

    List<Map<String, dynamic>> data = [];

    for (int i = 1; i < sortedReadings.length; i++) {
      final consumption = sortedReadings[i].reading - sortedReadings[i-1].reading;
      data.add({
        'date': sortedReadings[i].readingDate,
        'consumption': consumption > 0 ? consumption : 0,
      });
    }

    return data;
  }


  Future<void> refreshPropertyData() async {
    if (propertyId.isEmpty) {
      UIHelpers.showErrorSnackbar('Error', 'Property ID is missing');
      return;
    }

    await Future.wait([
      fetchPropertyDetails(),
      fetchMeterReadings(),
      fetchTokens(),
      fetchPayments(),
    ]);
  }


}

