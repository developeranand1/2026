import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.getUser();
    const token = this.authService.getToken();

    const allowedRoles = ['admin', 'superadmin', 'hr', 'accountant', 'ceo', 'cto'];
    const role = (user?.role || '').toLowerCase();

    if (token && user && allowedRoles.includes(role)) {
      return true;
    }

    // Redirect to admin login if not authenticated with staff/admin role
    this.router.navigate(['/admin/login']);
    return false;
  }
}
