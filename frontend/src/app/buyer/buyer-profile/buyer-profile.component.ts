import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buyer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buyer-profile.component.html',
  styleUrl: './buyer-profile.component.scss'
})
export class BuyerProfileComponent implements OnInit {
  private authService = inject(AuthService);

  isSaving = false;

  statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  profileData = {
    name: 'Amit Kumar',
    companyName: 'Amit Traders Pvt Ltd',
    businessType: 'Wholesaler / Bulk Buyer',
    mobile: '9876543210',
    email: 'amit.traders@KrisiMarg.com',
    gstNumber: '09AAAAA1111A1Z1',
    panNumber: 'ABCDE1234F',
    tradeLicense: 'TRD998877',
    street: 'Block C, Industrial Area',
    district: 'Kanpur',
    state: 'Uttar Pradesh',
    pincode: '208027',
    bankHolder: 'Amit Traders Pvt Ltd',
    bankAccount: '987654321098',
    bankIfsc: 'HDFC0001234',
    bankName: 'HDFC Bank'
  };

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      if (user.name) this.profileData.name = user.name;
      if (user.companyName) this.profileData.companyName = user.companyName;
      if (user.mobile) this.profileData.mobile = user.mobile;
      if (user.email) this.profileData.email = user.email;
      if (user.district) this.profileData.district = user.district;
      if (user.state) this.profileData.state = user.state;
      if (user.pincode) this.profileData.pincode = user.pincode;
      if (user.street) this.profileData.street = user.street;
    }
  }

  onSaveProfile(): void {
    this.isSaving = true;

    setTimeout(() => {
      this.isSaving = false;
      const updatedUser = {
        ...(this.authService.getUser() || {}),
        name: this.profileData.name,
        companyName: this.profileData.companyName,
        mobile: this.profileData.mobile,
        email: this.profileData.email,
        street: this.profileData.street,
        district: this.profileData.district,
        state: this.profileData.state,
        pincode: this.profileData.pincode
      };
      this.authService.saveUser(updatedUser);

      Swal.fire({
        title: 'Profile Updated!',
        text: 'Your buyer business profile details have been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#1a365d'
      });
    }, 800);
  }
}
