import 'package:flutter/material.dart';
import 'package:zinwa_mobile_app/models/meter_reading_model.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class MeterReadingListItem extends StatelessWidget {
  final MeterReading reading;

  const MeterReadingListItem({
    Key? key,
    required this.reading,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Reading icon
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.water_drop,
                color: AppColors.secondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            
            // Reading details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    UIHelpers.formatDate(reading.readingDate),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (reading.notes != null && reading.notes!.isNotEmpty)
                    Text(
                      reading.notes!,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                ],
              ),
            ),
            
            // Reading values
            Column(
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
                    'Usage: ${reading.consumption.toStringAsFixed(2)} m³',
                    style: TextStyle(
                      color: AppColors.info,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

