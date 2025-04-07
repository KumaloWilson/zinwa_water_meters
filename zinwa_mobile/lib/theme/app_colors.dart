import 'package:flutter/material.dart';

class AppColors {
  // Primary color - Blue representing water
  static Color primary = const Color(0xFF0277BD);
  
  // Secondary color - Light blue
  static Color secondary = const Color(0xFF4FC3F7);
  
  // Accent colors
  static Color accent = const Color(0xFF00BCD4);
  
  // Background colors
  static Color background = const Color(0xFFF5F5F5);
  static Color cardBackground = Colors.white;
  
  // Text colors
  static Color textPrimary = const Color(0xFF212121);
  static Color textSecondary = const Color(0xFF757575);
  static Color textLight = Colors.white;
  
  // Status colors
  static Color success = const Color(0xFF4CAF50);
  static Color warning = const Color(0xFFFFC107);
  static Color error = const Color(0xFFE53935);
  static Color info = const Color(0xFF2196F3);
  
  // Chart colors
  static List<Color> chartColors = [
    const Color(0xFF0277BD),
    const Color(0xFF4FC3F7),
    const Color(0xFF00BCD4),
    const Color(0xFF4CAF50),
    const Color(0xFFFFC107),
  ];
  
  // Gradient colors
  static LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

