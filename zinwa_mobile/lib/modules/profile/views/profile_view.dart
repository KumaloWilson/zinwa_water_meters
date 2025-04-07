import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/modules/profile/controllers/profile_controller.dart';
import 'package:zinwa_mobile_app/theme/app_colors.dart';
import 'package:zinwa_mobile_app/widgets/custom_button.dart';
import 'package:zinwa_mobile_app/widgets/custom_text_field.dart';

class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        centerTitle: true,
        actions: [
          Obx(
            () => controller.isLoading.value || controller.user.value == null
                ? const SizedBox()
                : controller.isEditMode.value
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: controller.toggleEditMode,
                      )
                    : IconButton(
                        icon: const Icon(Icons.edit),
                        onPressed: controller.toggleEditMode,
                      ),
          ),
        ],
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : controller.user.value == null
                ? _buildErrorState()
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Profile header
                        _buildProfileHeader(),
                        
                        const SizedBox(height: 24),
                        
                        // Profile form
                        Obx(
                          () => controller.isEditMode.value
                              ? _buildProfileForm()
                              : _buildProfileInfo(),
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Account actions
                        _buildAccountActions(),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    final user = controller.user.value!;
    
    return Center(
      child: Column(
        children: [
          // Avatar
          GestureDetector(
            onTap: controller.showAvatarOptions,
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: AppColors.primary.withOpacity(0.2),
                  child: Text(
                    '${user.firstName?[0]}${user.lastName?[0]}',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.camera_alt,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // User name
          Text(
            user.fullName,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          
          // User email
          Text(
            user.email ?? ' ',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          
          // User role
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              user.role!.capitalize!,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileInfo() {
    final user = controller.user.value!;
    
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
            const Text(
              'Personal Information',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // First name
            _buildInfoRow(
              icon: Icons.person,
              label: 'First Name',
              value: user.firstName ?? '',
            ),
            const SizedBox(height: 12),
            
            // Last name
            _buildInfoRow(
              icon: Icons.person,
              label: 'Last Name',
              value: user.lastName ?? '',
            ),
            const SizedBox(height: 12),
            
            // Phone
            _buildInfoRow(
              icon: Icons.phone,
              label: 'Phone',
              value: user.phone ?? 'Not provided',
            ),
            const SizedBox(height: 12),
            
            // Address
            _buildInfoRow(
              icon: Icons.home,
              label: 'Address',
              value: user.address ?? 'Not provided',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileForm() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: controller.formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Edit Personal Information',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              // First name
              CustomTextField(
                controller: controller.firstNameController,
                labelText: 'First Name',
                prefixIcon: Icons.person,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your first name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              // Last name
              CustomTextField(
                controller: controller.lastNameController,
                labelText: 'Last Name',
                prefixIcon: Icons.person,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your last name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              // Phone
              CustomTextField(
                controller: controller.phoneController,
                labelText: 'Phone',
                prefixIcon: Icons.phone,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              
              // Address
              CustomTextField(
                controller: controller.addressController,
                labelText: 'Address',
                prefixIcon: Icons.home,
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              
              // Save button
              Obx(
                () => CustomButton(
                  text: 'Save Changes',
                  isLoading: controller.isUpdating.value,
                  onPressed: controller.updateProfile,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAccountActions() {
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
            const Text(
              'Account Settings',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // Change password
            ListTile(
              leading: Icon(
                Icons.lock,
                color: AppColors.primary,
              ),
              title: const Text('Change Password'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              contentPadding: EdgeInsets.zero,
              onTap: controller.showChangePasswordDialog,
            ),
            
            // Notifications
            ListTile(
              leading: Icon(
                Icons.notifications,
                color: AppColors.secondary,
              ),
              title: const Text('Notification Settings'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              contentPadding: EdgeInsets.zero,
              onTap: () {
                // Navigate to notification settings
              },
            ),
            
            // Help & Support
            ListTile(
              leading: Icon(
                Icons.help,
                color: AppColors.info,
              ),
              title: const Text('Help & Support'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              contentPadding: EdgeInsets.zero,
              onTap: () {
                // Navigate to help & support
              },
            ),
            
            // About
            ListTile(
              leading: Icon(
                Icons.info,
                color: AppColors.accent,
              ),
              title: const Text('About'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              contentPadding: EdgeInsets.zero,
              onTap: () {
                // Navigate to about
              },
            ),
            
            const Divider(),
            
            // Logout
            ListTile(
              leading: Icon(
                Icons.logout,
                color: AppColors.error,
              ),
              title: const Text(
                'Logout',
                style: TextStyle(
                  color: Colors.red,
                ),
              ),
              contentPadding: EdgeInsets.zero,
              onTap: controller.logout,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: AppColors.primary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
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
            'Failed to load profile',
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
            onPressed: controller.loadUserProfile,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

