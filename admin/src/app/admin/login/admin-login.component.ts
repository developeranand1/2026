import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AdminDashboardService } from '../../core/admin-dashboard.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  private authService = inject(AuthService);
  private adminDashboardService = inject(AdminDashboardService);
  private router = inject(Router);

  mobile = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    // If already logged in as admin, auto-redirect to dashboard
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      if (user && user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  fillAdminCredentials(): void {
    this.mobile = '9999999999';
    this.password = 'admin123';
  }

  seedAdminUser(): void {
    this.isLoading = true;
    this.adminDashboardService.seedAdminUser().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.fillAdminCredentials();
        Swal.fire({
          title: 'Admin Created!',
          text: 'Default Admin user has been seeded into Database. Credentials filled.',
          icon: 'success',
          confirmButtonColor: '#2E7D32'
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Seed Error',
          text: err.error?.message || 'Failed to seed admin user',
          icon: 'error'
        });
      }
    });
  }

  onSubmitAdminLogin(): void {
    if (!this.mobile || !this.password) {
      this.errorMessage = 'Please provide both mobile number and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ mobile: this.mobile, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          if (response.data.role !== 'admin') {
            this.errorMessage = 'Access denied. Account is not registered as an Admin.';
            Swal.fire({
              title: 'Access Restricted',
              text: 'This account does not have Admin privileges.',
              icon: 'warning',
              confirmButtonColor: '#d33'
            });
            return;
          }

          Swal.fire({
            title: 'Welcome Admin!',
            text: 'Logged into GaonBazar Admin Dashboard successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/admin/dashboard']);
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials or database offline.';
        Swal.fire({
          title: 'Authentication Failed',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
