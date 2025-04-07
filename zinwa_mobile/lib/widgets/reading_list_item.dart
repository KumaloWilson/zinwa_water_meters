import 'package:flutter/material.dart';
import 'package:zinwa_mobile_app/models/meter_reading_model.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class ReadingListItem extends StatelessWidget {
  final MeterReading reading;
  final String propertyName;

  const ReadingListItem({
    Key? key,
    required this.reading,
    required this.propertyName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: AppColors.secondary.withOpacity(0.2),
        child: Icon(
          Icons.water_drop,
          color: AppColors.secondary,
        ),
      ),
      title: Text(
        propertyName,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
        ),
      ),
      subtitle: Text(
        UIHelpers.formatDate(reading.readingDate),
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 12,
        ),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${reading.reading.toStringAsFixed(2)} m³',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.info.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              'Consumption: ${reading.consumption.toStringAsFixed(2)} m³',
              style: TextStyle(
                color: AppColors.info,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

