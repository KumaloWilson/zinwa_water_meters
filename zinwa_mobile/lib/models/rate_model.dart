class Rate {
  final String id;
  final String propertyType;
  final double ratePerUnit;
  final double fixedCharge;
  final DateTime effectiveDate;
  final DateTime? endDate;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Rate({
    required this.id,
    required this.propertyType,
    required this.ratePerUnit,
    required this.fixedCharge,
    required this.effectiveDate,
    this.endDate,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Rate.fromJson(Map<String, dynamic> json) {
    return Rate(
      id: json['id'],
      propertyType: json['propertyType'],
      ratePerUnit: json['ratePerUnit'].toDouble(),
      fixedCharge: json['fixedCharge'].toDouble(),
      effectiveDate: DateTime.parse(json['effectiveDate']),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      isActive: json['isActive'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyType': propertyType,
      'ratePerUnit': ratePerUnit,
      'fixedCharge': fixedCharge,
      'effectiveDate': effectiveDate.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

