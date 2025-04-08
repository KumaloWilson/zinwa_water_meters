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

class TokenPurchaseResponse {
  final String message;
  final TokenPayment payment;
  final String redirectUrl;
  final String pollUrl;
  final double units;

  TokenPurchaseResponse({
    required this.message,
    required this.payment,
    required this.redirectUrl,
    required this.pollUrl,
    required this.units,
  });

  factory TokenPurchaseResponse.fromJson(Map<String, dynamic> json) {
    return TokenPurchaseResponse(
      message: json['message'],
      payment: TokenPayment.fromJson(json['payment']),
      redirectUrl: json['redirectUrl'],
      pollUrl: json['pollUrl'],
      units: (json['units'] as num).toDouble(),
    );
  }
}


class TokenPayment {
  final String id;
  final String referenceNumber;
  final double amount;
  final String status;
  final DateTime? paidAt;

  TokenPayment({
    required this.id,
    required this.referenceNumber,
    required this.amount,
    required this.status,
    this.paidAt,
  });

  factory TokenPayment.fromJson(Map<String, dynamic> json) {
    return TokenPayment(
      id: json['id'],
      referenceNumber: json['referenceNumber'],
      amount: (json['amount'] as num).toDouble(),
      status: json['status'],
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt']) : null,
    );
  }
}

class TokenCompleteResponse {
  final String message;
  final CompletedToken token;

  TokenCompleteResponse({
    required this.message,
    required this.token,
  });

  factory TokenCompleteResponse.fromJson(Map<String, dynamic> json) {
    return TokenCompleteResponse(
      message: json['message'],
      token: CompletedToken.fromJson(json['token']),
    );
  }
}

class CompletedToken {
  final String id;
  final String tokenValue;
  final double units;
  final double amount;

  CompletedToken({
    required this.id,
    required this.tokenValue,
    required this.units,
    required this.amount,
  });

  factory CompletedToken.fromJson(Map<String, dynamic> json) {
    return CompletedToken(
      id: json['id'],
      tokenValue: json['tokenValue'],
      units: (json['units'] as num).toDouble(),
      amount: (json['amount'] as num).toDouble(),
    );
  }
}