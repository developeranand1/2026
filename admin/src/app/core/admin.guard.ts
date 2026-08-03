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

    if (token && user && user.role === 'admin') {
      return true;
    }

    // Redirect to admin login if not logged in as admin
    this.router.navigate(['/admin/login']);
    return false;
  }
}
