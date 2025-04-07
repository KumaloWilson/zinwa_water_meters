import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/token_model.dart';
import 'package:zinwa_mobile_app/services/property_service.dart';
import 'package:zinwa_mobile_app/services/token_service.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class TokenController extends GetxController {
  final TokenService _tokenService = Get.find<TokenService>();
  final PropertyService _propertyService = Get.find<PropertyService>();
  
  // Tokens list
  final RxList<Token> tokens = <Token>[].obs;
  
  // Properties list (for mapping property names)
  final RxList<Property> properties = <Property>[].obs;
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;
  
  // Filter
  final RxString statusFilter = 'All'.obs;
  final RxList<Token> filteredTokens = <Token>[].obs;
  
  // Available status filters
  final List<String> statusFilters = ['All', 'Available', 'Used'];
  
  @override
  void onInit() {
    super.onInit();
    loadTokens();
  }
  
  // Load tokens
  Future<void> loadTokens() async {
    try {
      isLoading.value = true;
      
      // Load properties first (for mapping property names)
      final propertiesList = await _propertyService.getUserProperties();
      properties.value = propertiesList;
      
      // Load tokens
      final tokensList = await _tokenService.getUserTokens();
      tokens.value = tokensList;
      
      // Apply filter
      filterTokens();
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load tokens');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Refresh tokens
  Future<void> refreshTokens() async {
    try {
      isRefreshing.value = true;
      
      // Reload tokens
      final tokensList = await _tokenService.getUserTokens();
      tokens.value = tokensList;
      
      // Apply filter
      filterTokens();
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to refresh tokens');
    } finally {
      isRefreshing.value = false;
    }
  }
  
  // Filter tokens based on status
  void filterTokens() {
    if (statusFilter.value == 'All') {
      filteredTokens.value = tokens;
    } else if (statusFilter.value == 'Available') {
      filteredTokens.value = tokens.where((token) => !token.isUsed).toList();
    } else if (statusFilter.value == 'Used') {
      filteredTokens.value = tokens.where((token) => token.isUsed).toList();
    }
  }
  
  // Change status filter
  void changeStatusFilter(String status) {
    statusFilter.value = status;
    filterTokens();
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
  
  // Navigate to token detail
  void navigateToTokenDetail(String tokenId) {
    Get.toNamed('/token/$tokenId');
  }
}

