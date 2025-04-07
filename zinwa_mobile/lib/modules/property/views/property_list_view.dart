import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/property_card.dart';
import '../controllers/property_controller.dart';

class PropertyListView extends GetView<PropertyController> {
  const PropertyListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Properties'),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.properties.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        
        if (controller.properties.isEmpty) {
          return EmptyState(
            message: 'You don\'t have any properties yet',
            icon: Icons.home_outlined,
            title: 'No properties',
          );
        }
        
        return RefreshIndicator(
          onRefresh: controller.refreshProperties,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.properties.length,
            itemBuilder: (context, index) {
              final property = controller.properties[index];
              return PropertyCard(
                property: property,
                onTap: () => controller.navigateToPropertyDetail(property.id),
                onAddReading: () => controller.navigateToAddMeterReading(property.id),
                onMakePayment: () => controller.navigateToPayment(property.id),
              );
            },
          ),
        );
      }),
    );
  }
}

