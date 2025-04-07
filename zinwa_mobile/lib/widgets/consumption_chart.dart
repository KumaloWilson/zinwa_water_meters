import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';

class ConsumptionChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;

  const ConsumptionChart({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: _getMaxY(),
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            tooltipBorder: BorderSide(
              color: Colors.grey[800]!,
            ),
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              return BarTooltipItem(
                '${data[groupIndex]['date']}\n',
                const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                children: [
                  TextSpan(
                    text: '${rod.toY.toStringAsFixed(2)} m³',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value < 0 || value >= data.length) {
                  return const SizedBox();
                }
                
                // Format date for display (e.g., "Jan 1")
                final date = data[value.toInt()]['date'] as String;
                final parts = date.split('/');
                if (parts.length < 3) return const SizedBox();
                
                final day = parts[0];
                final month = _getMonthAbbreviation(int.parse(parts[1]));
                
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    '$month $day',
                    style: const TextStyle(
                      color: Colors.grey,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                );
              },
              reservedSize: 30,
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                return Text(
                  value.toInt().toString(),
                  style: const TextStyle(
                    color: Colors.grey,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                );
              },
              reservedSize: 30,
            ),
          ),
          topTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        borderData: FlBorderData(
          show: false,
        ),
        barGroups: _getBarGroups(),
        gridData: FlGridData(
          show: true,
          horizontalInterval: 1,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: Colors.grey[300],
              strokeWidth: 1,
            );
          },
          drawVerticalLine: false,
        ),
      ),
    );
  }

  double _getMaxY() {
    if (data.isEmpty) return 10;
    
    double maxConsumption = 0;
    for (var item in data) {
      final consumption = item['consumption'] as double;
      if (consumption > maxConsumption) {
        maxConsumption = consumption;
      }
    }
    
    // Add some padding to the max value
    return (maxConsumption * 1.2).ceilToDouble();
  }

  List<BarChartGroupData> _getBarGroups() {
    return List.generate(data.length, (index) {
      final item = data[index];
      final consumption = item['consumption'] as double;
      
      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: consumption,
            color: AppColors.primary,
            width: 16,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(4),
              topRight: Radius.circular(4),
            ),
          ),
        ],
      );
    });
  }

  String _getMonthAbbreviation(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    if (month < 1 || month > 12) return '';
    return months[month - 1];
  }
}

