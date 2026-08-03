import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buyer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './buyer-sidebar.component.html',
  styleUrl: './buyer-sidebar.component.scss'
})
export class BuyerSidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = false;
  buyerUser: any = null;
  isSidebarCollapsed = false;

  ngOnInit(): void {
    this.checkUser();
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.buyerUser = this.authService.getUser();
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    Swal.fire({
      title: 'Logout Buyer Portal?',
      text: 'Are you sure you want to log out of your buyer account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a365d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.isLoggedIn = false;
        this.buyerUser = null;
        this.router.navigate(['/login'], { queryParams: { mode: 'login', role: 'buyer' } });
      }
    });
  }
}
