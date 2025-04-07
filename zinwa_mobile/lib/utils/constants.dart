class Constants {
  // API
  static const String apiBaseUrl = 'http://10.0.2.2:5000/api'; // For Android emulator
  // static const String apiBaseUrl = 'http://localhost:5000/api'; // For iOS simulator
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'app_theme';
  
  // App settings
  static const bool isDevelopment = true;
  
  // Property types
  static const List<String> propertyTypes = [
    'RESIDENTIAL',
    'COMMERCIAL',
    'INDUSTRIAL',
    'AGRICULTURAL',
    'INSTITUTIONAL'
  ];
  
  // Payment methods
  static const List<String> paymentMethods = [
    'MOBILE_MONEY',
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'CASH'
  ];
}

