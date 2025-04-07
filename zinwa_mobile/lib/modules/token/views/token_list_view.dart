import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/token/controllers/token_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/widgets/token_list_item.dart';

class TokenListView extends GetView<TokenController> {
  const TokenListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tokens'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Status filter
          Padding(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Obx(
                () => Row(
                  children: controller.statusFilters.map((status) {
                    final isSelected = controller.statusFilter.value == status;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(status),
                        selected: isSelected,
                        onSelected: (_) => controller.changeStatusFilter(status),
                        backgroundColor: Colors.grey[200],
                        selectedColor: AppColors.primary.withOpacity(0.2),
                        checkmarkColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: isSelected ? AppColors.primary : Colors.black,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
          
          // Tokens list
          Expanded(
            child: Obx(
              () => controller.isLoading.value
                  ? const Center(child: CircularProgressIndicator())
                  : controller.filteredTokens.isEmpty
                      ? _buildEmptyState()
                      : RefreshIndicator(
                          onRefresh: controller.refreshTokens,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: controller.filteredTokens.length,
                            itemBuilder: (context, index) {
                              final token = controller.filteredTokens[index];
                              return GestureDetector(
                                onTap: () => controller.navigateToTokenDetail(token.id),
                                child: TokenListItem(token: token),
                              );
                            },
                          ),
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.confirmation_number,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            controller.statusFilter.value == 'All'
                ? 'No tokens found'
                : 'No ${controller.statusFilter.value.toLowerCase()} tokens found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            controller.statusFilter.value == 'All'
                ? 'Purchase tokens to see them here'
                : 'Try a different filter',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}

