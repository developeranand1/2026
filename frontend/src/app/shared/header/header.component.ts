import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);

  isLoggedIn = false;
  userName = '';
  userRole = '';
  userMobile = '';
  userLocation = '';
  isMobileMenuOpen = false;
  isPortalRoute = false;
  isUserDropdownOpen = false;

  ngOnInit(): void {
    this.checkLoginStatus();
    this.checkPortalRoute(this.router.url);

    // Re-verify login status and close menus on route changes
    this.router.events.subscribe(() => {
      this.checkLoginStatus();
      this.closeMobileMenu();
      this.closeUserDropdown();
      this.checkPortalRoute(this.router.url);
    });
  }

  checkPortalRoute(url: string): void {
    this.isPortalRoute = !!(url && (url.startsWith('/farmer') || url.startsWith('/buyer')));
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        this.isLoggedIn = true;
        const user = JSON.parse(userStr);
        this.userName = user.name || 'User';
        this.userRole = user.role || 'farmer';
        this.userMobile = user.mobile || '';
        this.userLocation = user.district ? `${user.district}, ${user.state || ''}` : (user.state || '');
      } catch (e) {
        this.isLoggedIn = false;
      }
    } else {
      this.isLoggedIn = false;
      this.userName = '';
      this.userRole = '';
      this.userMobile = '';
      this.userLocation = '';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleUserDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.closeUserDropdown();
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.userName = '';
    this.userRole = '';
    this.userMobile = '';
    this.userLocation = '';
    this.closeMobileMenu();
    this.router.navigate(['/login'], { queryParams: { mode: 'login' } });
  }
}
