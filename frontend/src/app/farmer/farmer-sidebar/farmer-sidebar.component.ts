import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-farmer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './farmer-sidebar.component.html',
  styleUrl: './farmer-sidebar.component.scss'
})
export class FarmerSidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = false;
  farmerUser: any = null;
  isSidebarCollapsed = false;

  ngOnInit(): void {
    this.checkUser();
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.farmerUser = this.authService.getUser();
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    Swal.fire({
      title: 'Logout Farmer Portal?',
      text: 'Are you sure you want to log out of your farmer account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E7D32',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.isLoggedIn = false;
        this.farmerUser = null;
        this.router.navigate(['/login'], { queryParams: { mode: 'login', role: 'farmer' } });
      }
    });
  }
}
