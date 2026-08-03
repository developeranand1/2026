import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab: 'login' | 'register' = 'login';
  selectedRole: 'farmer' | 'buyer' = 'farmer';

  isLoading = false;
  errorMessage = '';

  // Password visibility flags
  showPassword = false;
  showRegPassword = false;
  showRegConfirmPassword = false;

  // Form Models
  loginData = {
    mobile: '',
    password: ''
  };

  registerData = {
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Farmer location
    village: '',
    city: '',
    district: '',
    state: 'Bihar',
    pincode: '',
    // Buyer info
    companyName: '',
    gstNumber: '',
    street: ''
  };

  statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  ngOnInit(): void {
    // Read query params for pre-configuration
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'login' || params['mode'] === 'register') {
        this.activeTab = params['mode'];
      }
      if (params['role'] === 'farmer' || params['role'] === 'buyer') {
        this.selectedRole = params['role'];
      }
    });
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  setRole(role: 'farmer' | 'buyer'): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onSubmitLogin(): void {
    if (!this.loginData.mobile || !this.loginData.password) {
      this.errorMessage = 'Please enter both mobile number and password.';
      return;
    }

    if (this.loginData.mobile.length !== 10 || !/^\d+$/.test(this.loginData.mobile)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      mobile: this.loginData.mobile,
      password: this.loginData.password
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            title: 'Welcome Back!',
            text: response.message || 'Login successful',
            icon: 'success',
            confirmButtonColor: '#2E7D32',
            timer: 2000,
            timerProgressBar: true
          }).then(() => {
            const role = response.data.role;
            if (role === 'farmer') {
              this.router.navigate(['/farmer/dashboard']);
            } else if (role === 'buyer') {
              this.router.navigate(['/buyer/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          });
        } else {
          this.errorMessage = response.message || 'Login failed. Please try again.';
          Swal.fire({
            title: 'Login Failed',
            text: this.errorMessage,
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Server error.';
        Swal.fire({
          title: 'Login Error',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onSubmitRegister(): void {
    const d = this.registerData;

    // Common validation
    if (!d.name || !d.mobile || !d.password || !d.confirmPassword) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    if (d.mobile.length !== 10 || !/^\d+$/.test(d.mobile)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    if (d.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (d.password !== d.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Role-specific validation & payload preparation
    let payload: any = {
      name: d.name,
      mobile: d.mobile,
      email: d.email || undefined,
      password: d.password,
      role: this.selectedRole,
      state: d.state,
      district: d.district || undefined,
      city: d.city || undefined,
      pincode: d.pincode || undefined
    };

    if (this.selectedRole === 'farmer') {
      if (!d.village) {
        this.errorMessage = 'Village name is required for Farmers.';
        return;
      }
      payload.village = d.village;
      payload.city = d.city || d.village; // Use village if city is empty
    } else {
      if (!d.companyName) {
        this.errorMessage = 'Company/Business name is required for Buyers.';
        return;
      }
      payload.companyName = d.companyName;
      payload.gstNumber = d.gstNumber || undefined;
      payload.street = d.street || undefined;
      payload.city = d.city || d.district || 'City';
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            title: 'Account Created!',
            text: response.message || 'Registration successful',
            icon: 'success',
            confirmButtonColor: '#2E7D32',
            timer: 2000,
            timerProgressBar: true
          }).then(() => {
            if (this.selectedRole === 'farmer') {
              this.router.navigate(['/farmer/dashboard']);
            } else {
              this.router.navigate(['/buyer/dashboard']);
            }
          });
        } else {
          this.errorMessage = response.message || 'Registration failed.';
          Swal.fire({
            title: 'Registration Failed',
            text: this.errorMessage,
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Server error. Please verify database connection.';
        Swal.fire({
          title: 'Registration Error',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onSocialLogin(provider: string): void {
    Swal.fire({
      title: `${provider} Login`,
      text: `${provider} login integration is ready. Enter registered mobile to auto-sync your account!`,
      icon: 'info',
      confirmButtonColor: '#2E7D32'
    });
  }

  onQuickOtp(): void {
    if (!this.loginData.mobile || this.loginData.mobile.length !== 10) {
      Swal.fire({
        title: 'Enter Mobile Number',
        text: 'Please enter a valid 10-digit mobile number to receive OTP.',
        icon: 'warning',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }
    Swal.fire({
      title: 'OTP Sent!',
      text: `An OTP code has been dispatched via SMS / WhatsApp to +91 ${this.loginData.mobile}.`,
      icon: 'success',
      confirmButtonColor: '#2E7D32'
    });
  }
}
