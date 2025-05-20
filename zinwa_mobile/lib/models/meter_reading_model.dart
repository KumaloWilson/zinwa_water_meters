class MeterReading {
  final String id;
  final String propertyId;
  final double reading;
  final double consumption;
  final DateTime readingDate;
  final String? notes;
  final String? imageUrl;
  final bool isEstimated;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  MeterReading({
    required this.id,
    required this.propertyId,
    required this.reading,
    required this.consumption,
    required this.readingDate,
    this.notes,
    this.imageUrl,
    required this.isEstimated,
    this.createdAt,
    this.updatedAt,
  });

  factory MeterReading.fromJson(Map<String, dynamic> json) {
    return MeterReading(
      id: json['id'] ?? '',
      propertyId: json['propertyId'] ?? '',
      // Handle null values and different data types for numeric fields
      reading: json['reading'] != null
          ? (json['reading'] is double
          ? json['reading']
          : double.tryParse(json['reading'].toString()) ?? 0.0)
          : 0.0,
      consumption: json['consumption'] != null
          ? (json['consumption'] is double
          ? json['consumption']
          : double.tryParse(json['consumption'].toString()) ?? 0.0)
          : 0.0,
      readingDate: json['readingDate'] != null
          ? DateTime.parse(json['readingDate'])
          : DateTime.now(),
      notes: json['notes'],
      imageUrl: json['imageUrl'],
      isEstimated: json['isEstimated'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'id': id,
      'propertyId': propertyId,
      'reading': reading,
      'consumption': consumption,
      'readingDate': readingDate.toIso8601String(),
      'notes': notes,
      'imageUrl': imageUrl,
      'isEstimated': isEstimated,
    };

    if (createdAt != null) {
      data['createdAt'] = createdAt!.toIso8601String();
    }

    if (updatedAt != null) {
      data['updatedAt'] = updatedAt!.toIso8601String();
    }

    return data;
  }
}