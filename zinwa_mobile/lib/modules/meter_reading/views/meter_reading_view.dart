import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:zinwa_mobile_app/modules/meter_reading/controllers/meter_reading_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';
import 'package:zinwa_mobile_app/widgets/custom_button.dart';
import 'package:zinwa_mobile_app/widgets/custom_text_field.dart';

class MeterReadingView extends GetView<MeterReadingController> {
  const MeterReadingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Meter Reading'),
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
                          
                          // Last reading info
                          if (controller.lastReading.value != null)
                            _buildLastReadingInfo(),
                          
                          const SizedBox(height: 24),
                          
                          // Reading form
                          const Text(
                            'New Reading',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Reading value
                          CustomTextField(
                            controller: controller.readingController,
                            labelText: 'Meter Reading',
                            hintText: 'Enter current meter reading',
                            prefixIcon: Icons.water_drop,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter the meter reading';
                              }
                              
                              final reading = double.tryParse(value);
                              if (reading == null) {
                                return 'Please enter a valid number';
                              }

                              if (controller.lastReading.value != null && reading < controller.lastReading.value!.reading) {
                                return 'Reading cannot be less than the previous reading';
                              }


                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Reading date
                          InkWell(
                            onTap: controller.selectDate,
                            child: InputDecorator(
                              decoration: InputDecoration(
                                labelText: 'Reading Date',
                                prefixIcon: const Icon(Icons.calendar_today),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Obx(() => Text(UIHelpers.formatDate(controller.readingDate.value))),
                                  const Icon(Icons.arrow_drop_down),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Notes
                          CustomTextField(
                            controller: controller.notesController,
                            labelText: 'Notes',
                            hintText: 'Add any notes about this reading',
                            prefixIcon: Icons.note,
                            maxLines: 3,
                          ),
                          const SizedBox(height: 24),
                          
                          // Image upload
                          const Text(
                            'Meter Image',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Take a photo of your meter to verify the reading',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Image preview or upload button
                          Obx(
                            () => controller.imagePath.value.isEmpty
                                ? _buildImageUploadButton()
                                : _buildImagePreview(),
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Submit button
                          Obx(
                            () => CustomButton(
                              text: 'Submit Reading',
                              isLoading: controller.isSubmitting.value,
                              onPressed: controller.submitReading,
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

  Widget _buildLastReadingInfo() {
    final lastReading = controller.lastReading.value!;
    
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
                  Icons.history,
                  color: AppColors.secondary,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Last Reading',
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
                  'Reading:',
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                Text(
                  '${lastReading.reading.toStringAsFixed(2)} m³',
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
                  'Date:',
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                Text(
                  UIHelpers.formatDate(lastReading.readingDate),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            if (lastReading.notes != null && lastReading.notes!.isNotEmpty) ...[
              const SizedBox(height: 8),
              const Text(
                'Notes:',
                style: TextStyle(
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                lastReading.notes!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildImageUploadButton() {
    return Center(
      child: Column(
        children: [
          Container(
            width: double.infinity,
            height: 200,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.camera_alt,
                  size: 48,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                const Text(
                  'No image selected',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: () => controller.pickImage(ImageSource.camera),
                icon: const Icon(Icons.camera_alt),
                label: const Text('Take Photo'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
              ),
              const SizedBox(width: 16),
              OutlinedButton.icon(
                onPressed: () => controller.pickImage(ImageSource.gallery),
                icon: const Icon(Icons.photo_library),
                label: const Text('Gallery'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildImagePreview() {
    return Column(
      children: [
        Container(
          width: double.infinity,
          height: 200,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[300]!),
            image: DecorationImage(
              image: FileImage(File(controller.imagePath.value)),
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              onPressed: () => controller.pickImage(ImageSource.camera),
              icon: const Icon(Icons.camera_alt),
              label: const Text('Retake'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
            const SizedBox(width: 16),
            OutlinedButton.icon(
              onPressed: controller.removeImage,
              icon: const Icon(Icons.delete),
              label: const Text('Remove'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
              ),
            ),
          ],
        ),
      ],
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
}

