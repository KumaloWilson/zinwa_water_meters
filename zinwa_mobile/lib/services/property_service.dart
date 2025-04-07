import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/property_model.dart';
import 'package:zinwa_mobile_app/models/rate_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

class PropertyService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  // Get all properties for current user
  Future<List<Property>> getUserProperties() async {
    try {
      final response = await _apiService.get('/properties');
      final List<dynamic> propertiesJson = response.data;
      return propertiesJson.map((json) => Property.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // Get property by ID
  Future<Property> getPropertyById(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId');
      return Property.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Rate> getPropertyRate(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId');
      return Rate.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // Get property consumption history
  Future<Map<String, dynamic>> getPropertyConsumptionHistory(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId/consumption');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // Get property payment history
  Future<Map<String, dynamic>> getPropertyPaymentHistory(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId/payments');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // Get property tokens
  Future<Map<String, dynamic>> getPropertyTokens(String propertyId) async {
    try {
      final response = await _apiService.get('/properties/$propertyId/tokens');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}

