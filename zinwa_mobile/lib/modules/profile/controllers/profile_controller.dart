import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:zinwa_mobile_app/models/user_model.dart';
import 'package:zinwa_mobile_app/routes/app_pages.dart';
import 'package:zinwa_mobile_app/routes/app_routes.dart';
import 'package:zinwa_mobile_app/services/auth_service.dart';
import 'package:zinwa_mobile_app/services/user_service.dart';
import 'package:zinwa_mobile_app/utils/logs.dart';
import 'package:zinwa_mobile_app/utils/ui_helpers.dart';

class ProfileController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final UserService _userService = Get.find<UserService>();
  
  // User data
  final Rx<User?> user = Rx<User?>(null);
  
  // Form key
  final formKey = GlobalKey<FormState>();
  
  // Form controllers
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final phoneController = TextEditingController();
  
  // Password change form
  final passwordFormKey = GlobalKey<FormState>();
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  
  // Password visibility
  final RxBool obscureCurrentPassword = true.obs;
  final RxBool obscureNewPassword = true.obs;
  final RxBool obscureConfirmPassword = true.obs;
  
  // Loading states
  final RxBool isLoading = true.obs;
  final RxBool isUpdating = false.obs;
  final RxBool isChangingPassword = false.obs;
  final RxBool isUploadingAvatar = false.obs;
  
  // Edit mode
  final RxBool isEditMode = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    loadUserProfile();
  }
  
  @override
  void onClose() {
    firstNameController.dispose();
    lastNameController.dispose();
    phoneController.dispose();
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
  
  // Load user profile
  Future<void> loadUserProfile() async {
    try {
      isLoading.value = true;
      
      // Get current user
      final userData = await _userService.getUserProfile();
      user.value = userData;
      
      // Set form values
      firstNameController.text = userData.firstName ?? '';
      lastNameController.text = userData.lastName ?? '';
      phoneController.text = userData.phone ?? '';
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to load user profile');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Toggle edit mode
  void toggleEditMode() {
    isEditMode.value = !isEditMode.value;
    
    if (!isEditMode.value) {
      // Reset form values if canceling edit
      if (user.value != null) {
        firstNameController.text = user.value!.firstName ?? '';
        lastNameController.text = user.value!.lastName ?? '';
        phoneController.text = user.value!.phone ?? '';
      }
    }
  }
  
  // Update profile
  Future<void> updateProfile() async {
    if (formKey.currentState!.validate()) {
      try {
        isUpdating.value = true;
        
        // Prepare user data
        final userData = {
          'firstName': firstNameController.text,
          'lastName': lastNameController.text,
          'phone': phoneController.text,
        };

        DevLogs.logInfo(userData.toString());
        DevLogs.logInfo(user.value!.id);
        // Update user profile
        final updatedUser = await _userService.updateUserProfile(uid: user.value!.id, userData: userData);
        user.value = updatedUser;
        
        // Exit edit mode
        isEditMode.value = false;
        
        // Show success message
        UIHelpers.showSuccessSnackbar(
          'Success',
          'Profile updated successfully',
        );
      } catch (e) {
        UIHelpers.showErrorSnackbar('Error', 'Failed to update profile');
      } finally {
        isUpdating.value = false;
      }
    }
  }
  
  // Change password
  Future<void> changePassword() async {
    if (passwordFormKey.currentState!.validate()) {
      try {
        isChangingPassword.value = true;
        
        // Change password
        await _authService.changePassword(
          currentPasswordController.text,
          newPasswordController.text,
        );
        
        // Clear form
        currentPasswordController.clear();
        newPasswordController.clear();
        confirmPasswordController.clear();
        
        // Show success message
        UIHelpers.showSuccessSnackbar(
          'Success',
          'Password changed successfully',
        );
        
        // Close dialog
        Get.back();
      } catch (e) {
        UIHelpers.showErrorSnackbar('Error', 'Failed to change password');
      } finally {
        isChangingPassword.value = false;
      }
    }
  }
  
  // Upload avatar
  Future<void> uploadAvatar(ImageSource source) async {
    try {
      isUploadingAvatar.value = true;
      
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        imageQuality: 70,
      );
      
      if (pickedFile != null) {
        // Upload avatar
        final avatarUrl = await _userService.updateUserAvatar(pickedFile.path);
        
        // Update user data
        if (user.value != null) {
          // In a real app, you would update the user's avatar URL
          // For now, we'll just show a success message
        }
        
        // Show success message
        UIHelpers.showSuccessSnackbar(
          'Success',
          'Avatar updated successfully',
        );
      }
    } catch (e) {
      UIHelpers.showErrorSnackbar('Error', 'Failed to update avatar');
    } finally {
      isUploadingAvatar.value = false;
    }
  }
  
  // Show change password dialog
  void showChangePasswordDialog() {
    Get.dialog(
      AlertDialog(
        title: const Text('Change Password'),
        content: Form(
          key: passwordFormKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Current password
              Obx(
                () => TextFormField(
                  controller: currentPasswordController,
                  obscureText: obscureCurrentPassword.value,
                  decoration: InputDecoration(
                    labelText: 'Current Password',
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureCurrentPassword.value
                            ? Icons.visibility
                            : Icons.visibility_off,
                      ),
                      onPressed: () => obscureCurrentPassword.value = !obscureCurrentPassword.value,
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your current password';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 16),
              
              // New password
              Obx(
                () => TextFormField(
                  controller: newPasswordController,
                  obscureText: obscureNewPassword.value,
                  decoration: InputDecoration(
                    labelText: 'New Password',
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureNewPassword.value
                            ? Icons.visibility
                            : Icons.visibility_off,
                      ),
                      onPressed: () => obscureNewPassword.value = !obscureNewPassword.value,
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a new password';
                    }
                    if (value.length < 8) {
                      return 'Password must be at least 8 characters';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 16),
              
              // Confirm password
              Obx(
                () => TextFormField(
                  controller: confirmPasswordController,
                  obscureText: obscureConfirmPassword.value,
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureConfirmPassword.value
                            ? Icons.visibility
                            : Icons.visibility_off,
                      ),
                      onPressed: () => obscureConfirmPassword.value = !obscureConfirmPassword.value,
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != newPasswordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          Obx(
            () => ElevatedButton(
              onPressed: isChangingPassword.value ? null : changePassword,
              child: isChangingPassword.value
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Change'),
            ),
          ),
        ],
      ),
    );
  }
  
  // Show avatar options
  void showAvatarOptions() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Change Profile Picture',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Photo'),
              onTap: () {
                Get.back();
                uploadAvatar(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Get.back();
                uploadAvatar(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Get.back(),
                child: const Text('Cancel'),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  // Logout
  Future<void> logout() async {
    final confirmed = await UIHelpers.showConfirmationDialog(
      'Logout',
      'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
    );
    
    if (confirmed) {
      try {
        await _authService.logout();
        Get.offAllNamed(AppRoutes.LOGIN);
      } catch (e) {
        UIHelpers.showErrorSnackbar('Error', 'Failed to logout');
      }
    }
  }
}

