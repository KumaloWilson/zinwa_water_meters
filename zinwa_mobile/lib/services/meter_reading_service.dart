import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/meter_reading_model.dart';
import 'package:zinwa_mobile_app/services/api_service.dart';

class MeterReadingService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  // Get meter readings for a property
  Future<List<MeterReading>> getPropertyMeterReadings(String propertyId) async {
    try {
      final response = await _apiService.get('/meter-readings', queryParameters: {
        'propertyId': propertyId,
      });
      final List<dynamic> readingsJson = response.data;
      return readingsJson.map((json) => MeterReading.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // Submit a new meter reading
  Future<MeterReading> submitMeterReading(Map<String, dynamic> readingData, String? imagePath) async {
    try {
      dynamic data;
      
      if (imagePath != null) {
        data = FormData({
          ...readingData,
          'image': MultipartFile(imagePath, filename: imagePath.split('/').last),
        });
      } else {
        data = readingData;
      }
      
      final response = await _apiService.post('/meter-readings', data: data);
      return MeterReading.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // Get meter reading by ID
  Future<MeterReading> getMeterReadingById(String readingId) async {
    try {
      final response = await _apiService.get('/meter-readings/$readingId');
      return MeterReading.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}

