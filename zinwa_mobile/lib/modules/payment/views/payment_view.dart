import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/payment/controllers/payment_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/constants.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import 'package:zinwa_mobile_app/widgets/custom_button.dart';
import 'package:zinwa_mobile_app/widgets/custom_text_field.dart';

class PaymentView extends GetView<PaymentController> {
  const PaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Purchase Token'),
        centerTitle: true,
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : controller.property.value == null
                ? _buildErrorState()
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Form(
                      key: controller.formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Property info
                          _buildPropertyInfo(),
                          
                          const SizedBox(height: 24),
                          
                          // Rate info
                          if (controller.rate.value != null)
                            _buildRateInfo(),
                          
                          const SizedBox(height: 24),
                          
                          // Payment form
                          const Text(
                            'Payment Details',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Amount
                          CustomTextField(
                            controller: controller.amountController,
                            labelText: 'Amount',
                            hintText: 'Enter amount to pay',
                            prefixIcon: Icons.attach_money,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter the amount';
                              }
                              
                              final amount = double.tryParse(value);
                              if (amount == null) {
                                return 'Please enter a valid number';
                              }
                              
                              if (amount <= 0) {
                                return 'Amount must be greater than zero';
                              }
                              
                              if (controller.rate.value != null && 
                                  amount < controller.rate.value!.fixedCharge) {
                                return 'Amount must be at least ${UIHelpers.formatCurrency(controller.rate.value!.fixedCharge)}';
                              }
                              
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Calculated units
                          Obx(
                            () => Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.water_drop,
                                    color: AppColors.primary,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Estimated Units',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${controller.calculatedUnits.value.toStringAsFixed(2)} m³',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          const SizedBox(height: 32),
                          
                          // Payment button
                          Obx(
                            () => CustomButton(
                              text: 'Proceed to Payment',
                              isLoading: controller.isProcessing.value,
                              onPressed: controller.processPayment,
                            ),
                          ),
                          
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }

  Widget _buildPropertyInfo() {
    final property = controller.property.value!;
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.home,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Property Information',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            Text(
              property.propertyName,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              property.address,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.confirmation_number,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 4),
                Text(
                  'Meter Number: ${property.meterNumber}',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRateInfo() {
    final rate = controller.rate.value!;
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.attach_money,
                  color: AppColors.secondary,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Rate Information',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Rate per Unit:',
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                Text(
                  UIHelpers.formatCurrency(rate.ratePerUnit),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Fixed Charge:',
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                Text(
                  UIHelpers.formatCurrency(rate.fixedCharge),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Minimum Charge:',
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                Text(
                  UIHelpers.formatCurrency(rate.fixedCharge),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          const Text(
            'Failed to load property',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Please try again later',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Get.back(),
            child: const Text('Go Back'),
          ),
        ],
      ),
    );
  }

  String _formatPaymentMethod(String method) {
    return method.split('_').map((word) => word.capitalize).join(' ');
  }
}

