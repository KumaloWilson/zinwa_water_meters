import 'meter_reading_model.dart';

class Property {
  final String id;
  final String userId;
  final String propertyName;
  final String address;
  final String meterNumber;
  final String propertyType;
  final double currentBalance;
  final double totalConsumption;
  final bool isActive;
  final String? city;
  final String? province;
  final String? postalCode;
  final double? latitude;
  final double? longitude;
  final DateTime? lastTokenPurchase;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final List<MeterReading>? meterReadings;

  Property({
    required this.id,
    required this.userId,
    required this.propertyName,
    required this.address,
    required this.meterNumber,
    required this.propertyType,
    required this.currentBalance,
    required this.totalConsumption,
    required this.isActive,
    this.city,
    this.province,
    this.postalCode,
    this.latitude,
    this.longitude,
    this.lastTokenPurchase,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.meterReadings,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    // Handle meter readings if present
    List<MeterReading>? readings;
    if (json['meterReadings'] != null) {
      readings = (json['meterReadings'] as List)
          .map((reading) => MeterReading.fromJson(reading))
          .toList();
    }

    return Property(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      propertyName: json['propertyName'] ?? '',
      address: json['address'] ?? '',
      meterNumber: json['meterNumber'] ?? '',
      propertyType: json['propertyType'] ?? '',
      // Fix the toDouble on null error with proper null handling
      currentBalance: json['currentBalance'] != null
          ? (json['currentBalance'] is double
          ? json['currentBalance']
          : double.tryParse(json['currentBalance'].toString()) ?? 0.0)
          : 0.0,
      totalConsumption: json['totalConsumption'] != null
          ? (json['totalConsumption'] is double
          ? json['totalConsumption']
          : double.tryParse(json['totalConsumption'].toString()) ?? 0.0)
          : 0.0,
      isActive: json['isActive'] ?? true,
      city: json['city'],
      province: json['province'],
      postalCode: json['postalCode'],
      latitude: json['latitude'] != null
          ? (json['latitude'] is double
          ? json['latitude']
          : double.tryParse(json['latitude'].toString()))
          : null,
      longitude: json['longitude'] != null
          ? (json['longitude'] is double
          ? json['longitude']
          : double.tryParse(json['longitude'].toString()))
          : null,
      lastTokenPurchase: json['lastTokenPurchase'] != null
          ? DateTime.parse(json['lastTokenPurchase'])
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'])
          : null,
      meterReadings: readings,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'id': id,
      'userId': userId,
      'propertyName': propertyName,
      'address': address,
      'meterNumber': meterNumber,
      'propertyType': propertyType,
      'currentBalance': currentBalance,
      'totalConsumption': totalConsumption,
      'isActive': isActive,
      'city': city,
      'province': province,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'lastTokenPurchase': lastTokenPurchase?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };

    if (deletedAt != null) {
      data['deletedAt'] = deletedAt!.toIso8601String();
    }

    if (meterReadings != null && meterReadings!.isNotEmpty) {
      data['meterReadings'] = meterReadings!.map((reading) => reading.toJson()).toList();
    }

    return data;
  }
}
