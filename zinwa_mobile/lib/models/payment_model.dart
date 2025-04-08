class Payment {
  final String id;
  final String userId;
  final String propertyId;
  final String referenceNumber;
  final double amount;
  final String status;
  final String paymentMethod;
  final String? transactionId;
  final String? pollUrl;
  final PaymentDetails paymentDetails;
  final DateTime? paidAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Payment({
    required this.id,
    required this.userId,
    required this.propertyId,
    required this.referenceNumber,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    this.transactionId,
    this.pollUrl,
    required this.paymentDetails,
    this.paidAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      userId: json['userId'],
      propertyId: json['propertyId'],
      referenceNumber: json['referenceNumber'],
      amount: (json['amount'] as num).toDouble(),
      status: json['status'],
      paymentMethod: json['paymentMethod'],
      transactionId: json['transactionId'],
      pollUrl: json['pollUrl'],
      // Handle null paymentDetails
      paymentDetails: json['paymentDetails'] != null
          ? PaymentDetails.fromJson(json['paymentDetails'])
          : PaymentDetails(), // Provide an empty PaymentDetails object
      paidAt: json['paidAt'] != null ? DateTime.tryParse(json['paidAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class PaymentDetails {
  final String? status;
  final String? pollUrl;
  final String? redirectUrl;
  final String? transactionReference;
  final String? error;
  final String? notes;

  PaymentDetails({
    this.status,
    this.pollUrl,
    this.redirectUrl,
    this.transactionReference,
    this.error,
    this.notes,
  });

  factory PaymentDetails.fromJson(Map<String, dynamic> json) {
    return PaymentDetails(
      status: json['status'],
      pollUrl: json['pollUrl'],
      redirectUrl: json['redirectUrl'],
      transactionReference: json['transactionReference'],
      error: json['error'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'pollUrl': pollUrl,
      'redirectUrl': redirectUrl,
      'transactionReference': transactionReference,
      'error': error,
      'notes': notes,
    };
  }
}
