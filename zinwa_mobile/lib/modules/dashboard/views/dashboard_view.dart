import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import 'package:zinwa_mobile_app/widgets/dashboard_stat_card.dart';
import 'package:zinwa_mobile_app/widgets/payment_list_item.dart';
import 'package:zinwa_mobile_app/widgets/reading_list_item.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: controller.refreshDashboardData,
          ),
        ],
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: controller.refreshDashboardData,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Stats cards
                      Row(
                        children: [
                          Expanded(
                            child: DashboardStatCard(
                              title: 'Balance',
                              value: UIHelpers.formatCurrency(controller.totalBalance.value),
                              icon: Icons.account_balance_wallet,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: DashboardStatCard(
                              title: 'Consumption',
                              value: '${controller.totalConsumption.value.toStringAsFixed(2)} m³',
                              icon: Icons.water_drop,
                              color: AppColors.secondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: DashboardStatCard(
                              title: 'Properties',
                              value: controller.properties.length.toString(),
                              icon: Icons.home,
                              color: AppColors.accent,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: DashboardStatCard(
                              title: 'Active',
                              value: controller.activeProperties.value.toString(),
                              icon: Icons.check_circle,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Recent payments
                      const Text(
                        'Recent Payments',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      controller.recentPayments.isEmpty
                          ? const Card(
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Center(
                                  child: Text(
                                    'No recent payments',
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                ),
                              ),
                            )
                          : Card(
                              child: ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: controller.recentPayments.length,
                                separatorBuilder: (context, index) => const Divider(),
                                itemBuilder: (context, index) {
                                  final payment = controller.recentPayments[index];
                                  final property = controller.properties.firstWhere(
                                    (p) => p.id == payment.propertyId,
                                    orElse: () => controller.properties.first,
                                  );
                                  return PaymentListItem(
                                    payment: payment,
                                    propertyName: property.propertyName,
                                  );
                                },
                              ),
                            ),
                      
                      const SizedBox(height: 24),
                      
                      // Recent readings
                      const Text(
                        'Recent Meter Readings',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      controller.recentReadings.isEmpty
                          ? const Card(
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Center(
                                  child: Text(
                                    'No recent meter readings',
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                ),
                              ),
                            )
                          : Card(
                              child: ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: controller.recentReadings.length,
                                separatorBuilder: (context, index) => const Divider(),
                                itemBuilder: (context, index) {
                                  final reading = controller.recentReadings[index];
                                  final property = controller.properties.firstWhere(
                                    (p) => p.id == reading.propertyId,
                                    orElse: () => controller.properties.first,
                                  );
                                  return ReadingListItem(
                                    reading: reading,
                                    propertyName: property.propertyName,
                                  );
                                },
                              ),
                            ),
                      
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}

