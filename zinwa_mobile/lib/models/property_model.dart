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
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'],
      userId: json['userId'],
      propertyName: json['propertyName'],
      address: json['address'],
      meterNumber: json['meterNumber'],
      propertyType: json['propertyType'],
      currentBalance: json['currentBalance'].toDouble(),
      totalConsumption: json['totalConsumption'].toDouble(),
      isActive: json['isActive'],
      city: json['city'],
      province: json['province'],
      postalCode: json['postalCode'],
      latitude: json['latitude'] != null ? json['latitude'].toDouble() : null,
      longitude: json['longitude'] != null ? json['longitude'].toDouble() : null,
      lastTokenPurchase: json['lastTokenPurchase'] != null 
          ? DateTime.parse(json['lastTokenPurchase']) 
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
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
  }
}

