import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/payment_model.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/services/payment_service.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class PaymentHistoryController extends GetxController {
  final PaymentService _paymentService = Get.find<PaymentService>();
  final PropertyService _propertyService = Get.find<PropertyService>();
  
  // Payments list
  final RxList<Payment> payments = <Payment>[].obs;
  
  // Properties list (for mapping property names)
  final RxList<Property> properties = <Property>[].obs;
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;
  
  // Filter
  final RxString statusFilter = 'All'.obs;
  final RxList<Payment> filteredPayments = <Payment>[].obs;
  
  // Available status filters
  final List<String> statusFilters = ['All', 'Completed', 'Pending', 'Failed'];
  
  @override
  void onInit() {
    super.onInit();
    loadPaymentHistory();
  }
  
  // Load payment history
  Future<void> loadPaymentHistory() async {
    try {
      isLoading.value = true;
      
      // Load properties first (for mapping property names)
      final propertiesList = await _propertyService.getUserProperties();
      properties.value = propertiesList;
      
      // Load payments
      final paymentsList = await _paymentService.getUserPayments();
      payments.value = paymentsList;
      
      // Apply filter
      filterPayments();
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load payment history');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Refresh payment history
  Future<void> refreshPaymentHistory() async {
    try {
      isRefreshing.value = true;
      
      // Reload payments
      final paymentsList = await _paymentService.getUserPayments();
      payments.value = paymentsList;
      
      // Apply filter
      filterPayments();
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to refresh payment history');
    } finally {
      isRefreshing.value = false;
    }
  }
  
  // Filter payments based on status
  void filterPayments() {
    if (statusFilter.value == 'All') {
      filteredPayments.value = payments;
    } else {
      filteredPayments.value = payments.where((payment) {
        return payment.status.toLowerCase() == statusFilter.value.toLowerCase();
      }).toList();
    }
  }
  
  // Change status filter
  void changeStatusFilter(String status) {
    statusFilter.value = status;
    filterPayments();
  }
  
  // Get property name by ID
  String getPropertyName(String propertyId) {
    final property = properties.firstWhere(
      (p) => p.id == propertyId,
      orElse: () => Property(
        id: '',
        userId: '',
        propertyName: 'Unknown Property',
        address: '',
        meterNumber: '',
        propertyType: '',
        currentBalance: 0,
        totalConsumption: 0,
        isActive: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );
    
    return property.propertyName;
  }
}

