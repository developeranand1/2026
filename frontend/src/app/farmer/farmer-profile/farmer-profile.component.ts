import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
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

  isSaving = false;

  statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  profileData = {
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh.farmer@gaonbazar.com',
    fatherName: 'Suresh Kumar',
    village: 'Bhagwanpur',
    city: 'Muzaffarpur',
    district: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842001',
    totalLand: '5',
    landUnit: 'Bigha',
    irrigationType: 'Irrigated',
    bankHolder: 'Rajesh Kumar',
    bankAccount: '123456789012',
    bankIfsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    aadhaarNumber: 'XXXX-XXXX-1234'
  };

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      if (user.name) this.profileData.name = user.name;
      if (user.mobile) this.profileData.mobile = user.mobile;
      if (user.email) this.profileData.email = user.email;
      if (user.village) this.profileData.village = user.village;
      if (user.district) this.profileData.district = user.district;
      if (user.state) this.profileData.state = user.state;
      if (user.city) this.profileData.city = user.city;
      if (user.pincode) this.profileData.pincode = user.pincode;
    }
  }

  onSaveProfile(): void {
    this.isSaving = true;

    setTimeout(() => {
      this.isSaving = false;
      const updatedUser = {
        ...(this.authService.getUser() || {}),
        name: this.profileData.name,
        mobile: this.profileData.mobile,
        email: this.profileData.email,
        village: this.profileData.village,
        city: this.profileData.city,
        district: this.profileData.district,
        state: this.profileData.state,
        pincode: this.profileData.pincode
      };
      this.authService.saveUser(updatedUser);

      Swal.fire({
        title: 'Profile Updated!',
        text: 'Your farmer profile details have been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#2E7D32'
      });
    }, 800);
  }
}
