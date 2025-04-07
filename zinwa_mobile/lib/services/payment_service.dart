import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/payment_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

import '../utils/logs.dart';

class PaymentService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  // Get all payments for current user
  Future<List<Payment>> getUserPayments() async {
    try {
      final response = await _apiService.get('/payments');
      final List<dynamic> paymentsJson = response.data;
      return paymentsJson.map((json) => Payment.fromJson(json)).toList();
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get payment by ID
  Future<Payment> getPaymentById(String paymentId) async {
    try {
      final response = await _apiService.get('/payments/$paymentId');
      return Payment.fromJson(response.data);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  Future<List<Payment>> getPaymentsByPropertyId(String propertyId) async {
    try {
      final response = await _apiService.get('/payments/property/$propertyId');
      final List<dynamic> paymentsJson = response.data['payments'];
      return paymentsJson.map((json) => Payment.fromJson(json)).toList();
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Create a new payment
  Future<Map<String, dynamic>> createPayment(Map<String, dynamic> paymentData) async {
    try {
      final response = await _apiService.post('/payments', data: paymentData);
      return response.data;
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Verify payment
  Future<Map<String, dynamic>> verifyPayment(String paymentReference) async {
    try {
      final response = await _apiService.get('/payments/verify/$paymentReference');
      return response.data;
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }
}

