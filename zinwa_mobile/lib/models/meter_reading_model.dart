class MeterReading {
  final String id;
  final String propertyId;
  final double reading;
  final double consumption;
  final DateTime readingDate;
  final String? notes;
  final String? imageUrl;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  MeterReading({
    required this.id,
    required this.propertyId,
    required this.reading,
    required this.consumption,
    required this.readingDate,
    this.notes,
    this.imageUrl,
    required this.isVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MeterReading.fromJson(Map<String, dynamic> json) {
    return MeterReading(
      id: json['id'],
      propertyId: json['propertyId'],
      reading: json['reading'].toDouble(),
      consumption: json['consumption'].toDouble(),
      readingDate: DateTime.parse(json['readingDate']),
      notes: json['notes'],
      imageUrl: json['imageUrl'],
      isVerified: json['isVerified'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'reading': reading,
      'consumption': consumption,
      'readingDate': readingDate.toIso8601String(),
      'notes': notes,
      'imageUrl': imageUrl,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

