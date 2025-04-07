class Constants {
  // API
  static const String apiBaseUrl = 'https://zinwa.onrender.com/api';
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'app_theme';
  
  // App settings
  static const bool isDevelopment = true;
  
  // Property types
  static const List<String> propertyTypes = [
    'RESIDENTIAL_LOW_DENSITY',
    'RESIDENTIAL_HIGH_DENSITY',
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

