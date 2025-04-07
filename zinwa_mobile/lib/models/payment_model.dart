class Payment {
  final String id;
  final String propertyId;
  final double amount;
  final String paymentMethod;
  final String status;
  final String? transactionId;
  final String? paymentReference;
  final DateTime paymentDate;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Payment({
    required this.id,
    required this.propertyId,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.transactionId,
    this.paymentReference,
    required this.paymentDate,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      propertyId: json['propertyId'],
      amount: json['amount'].toDouble(),
      paymentMethod: json['paymentMethod'],
      status: json['status'],
      transactionId: json['transactionId'],
      paymentReference: json['paymentReference'],
      paymentDate: DateTime.parse(json['paymentDate']),
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'amount': amount,
      'paymentMethod': paymentMethod,
      'status': status,
      'transactionId': transactionId,
      'paymentReference': paymentReference,
      'paymentDate': paymentDate.toIso8601String(),
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

