import 'package:dio/dio.dart';
import 'package:get/get.dart' as Get;
import 'package:get_storage/get_storage.dart';
import 'package:zinwa_mobile_app/utils/constants.dart';

class ApiService extends Get.GetxService {
  late Dio _dio;
  final GetStorage _storage = Get.Get.find<GetStorage>();

  ApiService() {
    _initDio();
  }

  void _initDio() {
    final baseOptions = BaseOptions(
      baseUrl: Constants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    _dio = Dio(baseOptions);

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token to requests if available
          final token = _storage.read(Constants.tokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          // Handle common errors
          if (e.response?.statusCode == 401) {
            // Unauthorized - token expired or invalid
            _storage.remove(Constants.tokenKey);
            _storage.remove(Constants.userKey);
            Get.Get.offAllNamed('/login');
            return handler.reject(e);
          }
          return handler.next(e);
        },
      ),
    );

    // Add logging interceptor in debug mode
    if (Constants.isDevelopment) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
      ));
    }
  }

  // Generic GET request
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Generic POST request
  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.post(path, data: data, queryParameters: queryParameters);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Generic PUT request
  Future<Response> put(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.put(path, data: data, queryParameters: queryParameters);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Generic DELETE request
  Future<Response> delete(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.delete(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Generic PATCH request
  Future<Response> patch(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.patch(path, data: data, queryParameters: queryParameters);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Handle Dio errors
  Future<Response> _handleError(DioException e) async {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      throw Exception('Connection timeout. Please check your internet connection.');
    } else if (e.type == DioExceptionType.connectionError) {
      throw Exception('No internet connection. Please check your network settings.');
    } else {
      final errorMessage = e.response?.data?['message'] ?? 'An unexpected error occurred';
      throw Exception(errorMessage);
    }
  }
}

