class Token {
  final String id;
  final String propertyId;
  final String paymentId;
  final String tokenNumber;
  final double units;
  final bool isUsed;
  final DateTime? usedDate;
  final DateTime expiryDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Token({
    required this.id,
    required this.propertyId,
    required this.paymentId,
    required this.tokenNumber,
    required this.units,
    required this.isUsed,
    this.usedDate,
    required this.expiryDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Token.fromJson(Map<String, dynamic> json) {
    return Token(
      id: json['id'],
      propertyId: json['propertyId'],
      paymentId: json['paymentId'],
      tokenNumber: json['tokenNumber'],
      units: json['units'].toDouble(),
      isUsed: json['isUsed'],
      usedDate: json['usedDate'] != null ? DateTime.parse(json['usedDate']) : null,
      expiryDate: DateTime.parse(json['expiryDate']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'paymentId': paymentId,
      'tokenNumber': tokenNumber,
      'units': units,
      'isUsed': isUsed,
      'usedDate': usedDate?.toIso8601String(),
      'expiryDate': expiryDate.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

