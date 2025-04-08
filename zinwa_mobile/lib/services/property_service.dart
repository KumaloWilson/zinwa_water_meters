import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/rate_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';
import 'package:zinwa_mobile_app/services/auth_service.dart';

import '../utils/logs.dart';

class PropertyService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();
  final AuthService _authService = Get.find<AuthService>();

  // Get all properties for current user
  Future<List<Property>> getUserProperties() async {
    final String userId = _authService.currentUser?.id ?? '';

    try {
      final response = await _apiService.get('/properties/user/$userId');
      final List<dynamic> propertiesJson = response.data['properties'];
      return propertiesJson.map((json) => Property.fromJson(json)).toList();
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get property by ID
  Future<Property> getPropertyById(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId');
      return Property.fromJson(response.data['property']);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  Future<Rate> getPropertyRate(String propertyType) async {
    try {
      final response = await _apiService.get('/rates/property-type/$propertyType');
      return Rate.fromJson(response.data['rate']);
    } catch (e) {

      DevLogs.logInfo('Fetching rate for property type: $propertyType');
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get property consumption history
  Future<Map<String, dynamic>> getPropertyConsumptionHistory(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId/consumption');
      return response.data;
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get property payment history
  Future<Map<String, dynamic>> getPropertyPaymentHistory(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId/payments');
      return response.data;
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get property tokens
  Future<Map<String, dynamic>> getPropertyTokens(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId/tokens');
      return response.data;
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }
}

