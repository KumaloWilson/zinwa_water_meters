import 'package:flutter/material.dart';
import 'package:zinwa_mobile_app/models/payment_model.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class PaymentListItem extends StatelessWidget {
  final Payment payment;
  final String propertyName;

  const PaymentListItem({
    Key? key,
    required this.payment,
    required this.propertyName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: _getStatusColor(payment.status).withOpacity(0.2),
        child: Icon(
          _getStatusIcon(payment.status),
          color: _getStatusColor(payment.status),
        ),
      ),
      title: Text(
        propertyName,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
        ),
      ),
      subtitle: Text(
        UIHelpers.formatDate(payment.paymentDate),
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
            UIHelpers.formatCurrency(payment.amount),
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: _getStatusColor(payment.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              payment.status.toUpperCase(),
              style: TextStyle(
                color: _getStatusColor(payment.status),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'failed':
        return AppColors.error;
      default:
        return AppColors.info;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Icons.check_circle;
      case 'pending':
        return Icons.pending;
      case 'failed':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }
}

