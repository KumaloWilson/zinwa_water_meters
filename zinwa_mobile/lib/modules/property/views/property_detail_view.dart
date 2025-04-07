import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/property/controllers/property_detail_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import 'package:zinwa_mobile_app/widgets/consumption_chart.dart';
import 'package:zinwa_mobile_app/widgets/meter_reading_list_item.dart';
import 'package:zinwa_mobile_app/widgets/payment_list_item.dart';
import 'package:zinwa_mobile_app/widgets/token_list_item.dart';

class PropertyDetailView extends GetView<PropertyDetailController> {
  const PropertyDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() => Text(controller.property.value?.propertyName ?? 'Property Details')),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: controller.refreshPropertyData,
          ),
        ],
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : controller.property.value == null
                ? _buildErrorState()
                : RefreshIndicator(
                    onRefresh: controller.refreshPropertyData,
                    child: Column(
                      children: [
                        // Property summary
                        _buildPropertySummary(),
                        
                        // Consumption chart
                        _buildConsumptionChart(),
                        
                        // Tab bar
                        TabBar(
                          controller: controller.tabController,
                          labelColor: AppColors.primary,
                          unselectedLabelColor: Colors.grey,
                          indicatorColor: AppColors.primary,
                          tabs: const [
                            Tab(text: 'Readings'),
                            Tab(text: 'Payments'),
                            Tab(text: 'Tokens'),
                          ],
                        ),
                        
                        // Tab content
                        Expanded(
                          child: TabBarView(
                            controller: controller.tabController,
                            children: [
                              // Meter readings tab
                              _buildMeterReadingsTab(),
                              
                              // Payments tab
                              _buildPaymentsTab(),
                              
                              // Tokens tab
                              _buildTokensTab(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
      floatingActionButton: Obx(
        () => controller.isLoading.value || controller.property.value == null
            ? const SizedBox()
            : FloatingActionButton.extended(
                onPressed: controller.tabController.index == 0
                    ? controller.navigateToAddMeterReading
                    : controller.navigateToPayment,
                icon: Icon(
                  controller.tabController.index == 0
                      ? Icons.add_chart
                      : Icons.shopping_cart,
                ),
                label: Text(
                  controller.tabController.index == 0
                      ? 'Add Reading'
                      : 'Buy Token',
                ),
                backgroundColor: AppColors.primary,
              ),
      ),
    );
  }

  Widget _buildPropertySummary() {
    final property = controller.property.value!;
    
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.primary.withOpacity(0.05),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Property info
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Property icon
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getPropertyTypeIcon(property.propertyType),
                  color: AppColors.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              
              // Property details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.confirmation_number,
                          size: 14,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Meter: ${property.meterNumber}',
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
              
              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: property.isActive ? AppColors.success : Colors.grey,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  property.isActive ? 'Active' : 'Inactive',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Stats
          Row(
            children: [
              // Current balance
              Expanded(
                child: _buildStatCard(
                  icon: Icons.account_balance_wallet,
                  label: 'Current Balance',
                  value: UIHelpers.formatCurrency(property.currentBalance),
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 16),
              
              // Total consumption
              Expanded(
                child: _buildStatCard(
                  icon: Icons.water_drop,
                  label: 'Total Consumption',
                  value: '${property.totalConsumption.toStringAsFixed(2)} m³',
                  color: AppColors.secondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildConsumptionChart() {
    return Obx(
      () => controller.consumptionData.isEmpty
          ? const SizedBox(height: 200, child: Center(child: Text('No consumption data available')))
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Consumption History',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 200,
                    child: ConsumptionChart(data: controller.consumptionData),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildMeterReadingsTab() {
    return Obx(
      () => controller.isLoadingReadings.value
          ? const Center(child: CircularProgressIndicator())
          : controller.meterReadings.isEmpty
              ? _buildEmptyState(
                  icon: Icons.water_drop,
                  title: 'No meter readings',
                  message: 'Add your first meter reading',
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: controller.meterReadings.length,
                  separatorBuilder: (context, index) => const Divider(),
                  itemBuilder: (context, index) {
                    final reading = controller.meterReadings[index];
                    return MeterReadingListItem(reading: reading);
                  },
                ),
    );
  }

  Widget _buildPaymentsTab() {
    return Obx(
      () => controller.isLoadingPayments.value
          ? const Center(child: CircularProgressIndicator())
          : controller.payments.isEmpty
              ? _buildEmptyState(
                  icon: Icons.payment,
                  title: 'No payments',
                  message: 'Make your first payment',
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: controller.payments.length,
                  separatorBuilder: (context, index) => const Divider(),
                  itemBuilder: (context, index) {
                    final payment = controller.payments[index];
                    return PaymentListItem(
                      payment: payment,
                      propertyName: controller.property.value!.propertyName,
                    );
                  },
                ),
    );
  }

  Widget _buildTokensTab() {
    return Obx(
      () => controller.isLoadingTokens.value
          ? const Center(child: CircularProgressIndicator())
          : controller.tokens.isEmpty
              ? _buildEmptyState(
                  icon: Icons.confirmation_number,
                  title: 'No tokens',
                  message: 'Purchase your first token',
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: controller.tokens.length,
                  separatorBuilder: (context, index) => const Divider(),
                  itemBuilder: (context, index) {
                    final token = controller.tokens[index];
                    return TokenListItem(token: token);
                  },
                ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                size: 16,
                color: color,
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String message,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
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
            onPressed: controller.refreshPropertyData,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  IconData _getPropertyTypeIcon(String propertyType) {
    switch (propertyType.toLowerCase()) {
      case 'residential_low_density':
      case 'residential_high_density':
        return Icons.home;
      case 'commercial':
        return Icons.store;
      case 'industrial':
        return Icons.factory;
      case 'agricultural':
        return Icons.agriculture;
      default:
        return Icons.business;
    }
  }
}

