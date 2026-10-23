import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { UserService } from '../../core/user.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-farmer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './farmer-profile.component.html',
  styleUrl: './farmer-profile.component.scss'
})
export class FarmerProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private mandiRateService = inject(MandiRateService);

  isLoading = false;
  isSaving = false;
  isUploadingPassbook = false;
  userId = '';

  statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  profileData = {
    name: '',
    mobile: '',
    email: '',
    fatherName: '',
    village: '',
    city: '',
    district: '',
    state: 'Bihar',
    pincode: '',
    totalLand: '',
    landUnit: 'Bigha',
    irrigationType: 'Irrigated',
    bankHolder: '',
    bankAccount: '',
    bankIfsc: '',
    bankName: '',
    passbookImage: '',
    aadhaarNumber: ''
  };

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user._id || user.id || user.mobile || '';
      // Pre-fill immediately with known localStorage info
      if (user.name) this.profileData.name = user.name;
      if (user.mobile) this.profileData.mobile = user.mobile;
      if (user.email) this.profileData.email = user.email;
      if (user.village) this.profileData.village = user.village;
      if (user.district) this.profileData.district = user.district;
      if (user.state) this.profileData.state = user.state;
      if (user.city) this.profileData.city = user.city;
      if (user.pincode) this.profileData.pincode = user.pincode;

      // Fetch latest full profile from backend
      if (this.userId) {
        this.loadProfileFromBackend(this.userId);
      }
    }
  }

  loadProfileFromBackend(userId: string): void {
    this.isLoading = true;
    this.userService.getUserProfile(userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && res.data) {
          const u = res.data;
          const fp = u.farmerProfile || {};
          const loc = fp.location || {};
          const bank = fp.bankDetails || {};

          this.profileData = {
            name: u.name || this.profileData.name,
            mobile: u.mobile || this.profileData.mobile,
            email: u.email || this.profileData.email,
            fatherName: fp.fatherName || this.profileData.fatherName,
            village: loc.village || u.village || this.profileData.village,
            city: loc.city || u.city || this.profileData.city,
            district: loc.district || u.district || this.profileData.district,
            state: loc.state || u.state || this.profileData.state,
            pincode: loc.pincode || u.pincode || this.profileData.pincode,
            totalLand: fp.totalLand || this.profileData.totalLand,
            landUnit: fp.landUnit || this.profileData.landUnit || 'Bigha',
            irrigationType: fp.irrigationType || this.profileData.irrigationType || 'Irrigated',
            bankHolder: bank.accountHolderName || this.profileData.bankHolder || u.name || '',
            bankAccount: bank.accountNumber || this.profileData.bankAccount,
            bankIfsc: bank.ifscCode || this.profileData.bankIfsc,
            bankName: bank.bankName || this.profileData.bankName,
            passbookImage: bank.passbookImage || this.profileData.passbookImage || '',
            aadhaarNumber: fp.aadhaarNumber || this.profileData.aadhaarNumber
          };
        }
      },
      error: () => {
        this.isLoading = false;
        // Keep current form values if backend query fails
      }
    });
  }

  onPassbookSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Too Large',
        text: 'Passbook photo should be under 2MB.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Str = reader.result as string;
      this.isUploadingPassbook = true;
      this.mandiRateService.uploadCropImage(base64Str).subscribe({
        next: (res: any) => {
          this.isUploadingPassbook = false;
          if (res?.success && res?.url) {
            this.profileData.passbookImage = res.url;
            Swal.fire({
              icon: 'success',
              title: 'Passbook Uploaded',
              text: 'Bank Passbook photo uploaded successfully. Click Save to preserve changes.',
              confirmButtonColor: '#2E7D32',
              timer: 2000
            });
          }
        },
        error: () => {
          this.isUploadingPassbook = false;
          Swal.fire('Upload Failed', 'Could not upload passbook image. Please try again.', 'error');
        }
      });
    };
  }

  removePassbook(): void {
    this.profileData.passbookImage = '';
  }

  onSaveProfile(): void {
    if (!this.profileData.name || !this.profileData.mobile) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Farmer Name and Mobile Number are required.',
        icon: 'warning',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    const user = this.authService.getUser();
    const targetId = this.userId || user?._id || user?.id || this.profileData.mobile;

    if (!targetId) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to update your profile.',
        icon: 'warning',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    this.isSaving = true;

    // Send PUT request to backend update profile API
    this.userService.updateUserProfile(targetId, this.profileData).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res && res.success) {
          // Update local session
          const currentSavedUser = this.authService.getUser() || {};
          const updatedLocalUser = {
            ...currentSavedUser,
            name: this.profileData.name,
            mobile: this.profileData.mobile,
            email: this.profileData.email,
            village: this.profileData.village,
            city: this.profileData.city,
            district: this.profileData.district,
            state: this.profileData.state,
            pincode: this.profileData.pincode
          };
          this.authService.saveUser(updatedLocalUser);

          Swal.fire({
            title: 'Profile Updated!',
            text: 'Your farmer profile details have been saved successfully via PUT API.',
            icon: 'success',
            confirmButtonColor: '#2E7D32'
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err?.error?.message || 'Failed to update profile. Please try again.';
        Swal.fire({
          title: 'Update Error',
          text: msg,
          icon: 'error',
          confirmButtonColor: '#2E7D32'
        });
      }
    });
  }
}
