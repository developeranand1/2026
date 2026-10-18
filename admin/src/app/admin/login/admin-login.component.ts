import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
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
  private router = inject(Router);

  mobile = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      const allowedRoles = ['admin', 'superadmin', 'hr', 'accountant', 'ceo', 'cto'];
      if (user && allowedRoles.includes((user.role || '').toLowerCase())) {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  onSubmitAdminLogin(): void {
    if (!this.mobile || !this.password) {
      this.errorMessage = 'Please provide both mobile number and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const allowedRoles = ['admin', 'superadmin', 'hr', 'accountant', 'ceo', 'cto'];

    // Try Staff Login first
    this.authService.login({ mobile: this.mobile, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const role = (response.data.role || '').toLowerCase();
          if (!allowedRoles.includes(role)) {
            this.errorMessage = 'Access denied. Account is not authorized for Admin/Staff Portal.';
            Swal.fire({
              title: 'Access Restricted',
              text: 'This account does not have Staff/Admin access rights.',
              icon: 'warning',
              confirmButtonColor: '#d33'
            });
            return;
          }

          Swal.fire({
            title: `Welcome, ${response.data.name}!`,
            text: `Signed in as [${response.data.role?.toUpperCase()}]`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/admin/dashboard']);
          });
        }
      },
      error: (err) => {
        // Fallback to legacy user login (if admin exists in User table)
        this.authService.loginGeneral({ mobile: this.mobile, password: this.password }).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.data.role === 'admin') {
              Swal.fire({
                title: 'Welcome Admin!',
                text: 'Logged into KrisiMarg Admin Portal successfully.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                this.router.navigate(['/admin/dashboard']);
              });
            } else {
              this.errorMessage = 'Access denied. Admin rights required.';
              Swal.fire({
                title: 'Access Restricted',
                text: 'This account does not have Admin privileges.',
                icon: 'warning',
                confirmButtonColor: '#d33'
              });
            }
          },
          error: (legacyErr) => {
            this.isLoading = false;
            this.errorMessage = legacyErr.error?.message || err.error?.message || 'Invalid credentials or database connection failed.';
            Swal.fire({
              title: 'Authentication Failed',
              text: this.errorMessage,
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }
}
