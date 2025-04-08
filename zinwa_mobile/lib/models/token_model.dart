class Token {
  final String id;
  final String userId;
  final String propertyId;
  final String paymentId;
  final String tokenValue;
  final double units;
  final double amount;
  final bool isUsed;
  final DateTime? usedAt;
  final DateTime expiresAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final TokenPayment payment;

  Token({
    required this.id,
    required this.userId,
    required this.propertyId,
    required this.paymentId,
    required this.tokenValue,
    required this.units,
    required this.amount,
    required this.isUsed,
    this.usedAt,
    required this.expiresAt,
    required this.createdAt,
    required this.updatedAt,
    required this.payment,
  });

  factory Token.fromJson(Map<String, dynamic> json) {
    return Token(
      id: json['id'],
      userId: json['userId'],
      propertyId: json['propertyId'],
      paymentId: json['paymentId'],
      tokenValue: json['tokenValue'],
      units: (json['units'] as num).toDouble(),
      amount: (json['amount'] as num).toDouble(),
      isUsed: json['isUsed'],
      usedAt: json['usedAt'] != null ? DateTime.parse(json['usedAt']) : null,
      expiresAt: DateTime.parse(json['expiresAt']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      payment: TokenPayment.fromJson(json['payment']),
    );
  }
}

class TokenPayment {
  final String id;
  final String referenceNumber;
  final double amount;
  final String status;
  final DateTime paidAt;

  TokenPayment({
    required this.id,
    required this.referenceNumber,
    required this.amount,
    required this.status,
    required this.paidAt,
  });

  factory TokenPayment.fromJson(Map<String, dynamic> json) {
    return TokenPayment(
      id: json['id'],
      referenceNumber: json['referenceNumber'],
      amount: (json['amount'] as num).toDouble(),
      status: json['status'],
      paidAt: DateTime.parse(json['paidAt']),
    );
  }
}