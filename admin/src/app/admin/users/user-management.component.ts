import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminUserService, UserAccount, UserStats } from '../../core/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(AdminUserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // View state: 'list' for table dashboard, 'view' for full-page user details profile
  viewMode: 'list' | 'view' = 'list';

  usersList: UserAccount[] = [];
  selectedUser: UserAccount | null = null;

  stats: UserStats = {
    totalUsers: 0,
    farmersCount: 0,
    buyersCount: 0,
    blockedCount: 0,
    verifiedCount: 0
  };

  selectedRoleFilter = 'all';
  selectedStatusFilter = 'all';
  searchTerm = '';
  isLoading = false;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id || this.router.url.includes('/users/view/')) {
        const userId = id || this.router.url.split('/users/view/')[1];
        this.viewMode = 'view';
        if (userId) {
          this.loadUserDetails(userId);
        }
      } else {
        this.viewMode = 'list';
        this.loadUsers();
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.selectedRoleFilter, this.selectedStatusFilter, this.searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.usersList = res.data;
          this.stats = res.stats;
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load users list', 'error');
      }
    });
  }

  loadUserDetails(id: string): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.selectedUser = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load user profile details', 'error');
        this.goToList();
      }
    });
  }

  filterByRole(role: string): void {
    this.selectedRoleFilter = role;
    this.loadUsers();
  }

  filterByStatus(status: string): void {
    this.selectedStatusFilter = status;
    this.loadUsers();
  }

  onSearch(): void {
    this.loadUsers();
  }

  openUserDetailPage(user: UserAccount, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/admin/users/view', user._id]);
  }

  goToList(): void {
    this.router.navigate(['/admin/users']);
  }

  toggleUserStatus(user: UserAccount, event?: Event): void {
    if (event) event.stopPropagation();
    const newStatus: 'active' | 'blocked' = user.status === 'active' ? 'blocked' : 'active';
    const actionText = newStatus === 'blocked' ? 'Block' : 'Activate';

    Swal.fire({
      title: `${actionText} User Account?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} user "${user.name}" (${user.mobile})?`,
      icon: newStatus === 'blocked' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'blocked' ? '#dc3545' : '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.updateUserStatus(user._id, newStatus).subscribe({
          next: (res) => {
            if (res.success) {
              user.status = newStatus;
              if (this.selectedUser && this.selectedUser._id === user._id) {
                this.selectedUser.status = newStatus;
              }
              Swal.fire({
                icon: 'success',
                title: 'Status Updated!',
                text: `User is now ${newStatus}.`,
                timer: 2000,
                showConfirmButton: false
              });
              if (this.viewMode === 'list') {
                this.loadUsers();
              }
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to update user status', 'error');
          }
        });
      }
    });
  }

  toggleUserVerification(user: UserAccount, event?: Event): void {
    if (event) event.stopPropagation();
    const targetState = !user.isVerified;
    const actionText = targetState ? 'Verify' : 'Unverify';

    Swal.fire({
      title: `${actionText} User Account?`,
      text: `Mark user "${user.name}" as ${targetState ? 'Verified' : 'Unverified'}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.updateUserVerification(user._id, targetState).subscribe({
          next: (res) => {
            if (res.success) {
              user.isVerified = targetState;
              if (this.selectedUser && this.selectedUser._id === user._id) {
                this.selectedUser.isVerified = targetState;
              }
              Swal.fire({
                icon: 'success',
                title: 'Verification Updated!',
                text: `User is now ${targetState ? 'Verified' : 'Unverified'}.`,
                timer: 2000,
                showConfirmButton: false
              });
              if (this.viewMode === 'list') {
                this.loadUsers();
              }
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to update verification', 'error');
          }
        });
      }
    });
  }

  deleteUser(user: UserAccount, event?: Event): void {
    if (event) event.stopPropagation();
    Swal.fire({
      title: 'Delete User Account?',
      text: `Are you sure you want to permanently delete user "${user.name}" (${user.mobile}) and profile data?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete Account'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user._id).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                icon: 'success',
                title: 'User Deleted!',
                text: 'Account deleted successfully.',
                timer: 2000,
                showConfirmButton: false
              });
              this.goToList();
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete user', 'error');
          }
        });
      }
    });
  }

  getLocationString(user: UserAccount): string {
    if (user.farmerProfile?.location) {
      const loc = user.farmerProfile.location;
      const parts = [loc.village, loc.district, loc.state].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Location not set';
    }
    if (user.buyerProfile?.address) {
      const addr = user.buyerProfile.address;
      const parts = [addr.city, addr.district, addr.state].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Address not set';
    }
    return 'Not provided';
  }
}
