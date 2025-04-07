import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/token_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

class TokenService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  // Get all tokens for current user
  Future<List<Token>> getUserTokens() async {
    try {
      final response = await _apiService.get('/tokens');
      final List<dynamic> tokensJson = response.data;
      return tokensJson.map((json) => Token.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // Get token by ID
  Future<Token> getTokenById(String tokenId) async {
    try {
      final response = await _apiService.get('/tokens/$tokenId');
      return Token.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // Get tokens for a property
  Future<List<Token>> getPropertyTokens(String propertyId) async {
    try {
      final response = await _apiService.get('/tokens', queryParameters: {
        'propertyId': propertyId,
      });
      final List<dynamic> tokensJson = response.data;
      return tokensJson.map((json) => Token.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }
}

