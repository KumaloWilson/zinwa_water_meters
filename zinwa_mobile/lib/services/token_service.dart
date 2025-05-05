import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/token_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

import '../utils/logs.dart';

class TokenService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  // Get all tokens for current user
  Future<List<Token>> getUserTokens() async {
    try {
      final response = await _apiService.get('/tokens');
      final List<dynamic> tokensJson = response.data;
      return tokensJson.map((json) => Token.fromJson(json)).toList();
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get token by ID
  Future<Token> getTokenById(String tokenId) async {
    try {
      final response = await _apiService.get('/tokens/$tokenId');
      return Token.fromJson(response.data);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Get tokens for a property
  Future<List<Token>> getPropertyTokens(String propertyId) async {
    try {
      final response = await _apiService.get('/tokens/property/$propertyId', queryParameters: {});
      final List<dynamic> tokensJson = response.data['tokens'];
      return tokensJson.map((json) => Token.fromJson(json)).toList();
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Initiate token purchase
  Future<TokenPurchaseResponse> purchaseToken({required String propertyId, required num amount}) async {
    try {
      final response = await _apiService.post('/tokens/purchase', data: {
        'propertyId': propertyId,
        'amount': amount
      });
      return TokenPurchaseResponse.fromJson(response.data);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }

  // Complete token purchase
  Future<TokenCompleteResponse> completeTokenPurchase({required String reference, required String status, required String pollUrl}) async {
    try {
      final response = await _apiService.post('/tokens/complete', data: {
        'reference': reference,
        'status': status,
        'pollurl': pollUrl
      });
      return TokenCompleteResponse.fromJson(response.data);
    } catch (e) {
      DevLogs.logError(e.toString());
      rethrow;
    }
  }
}