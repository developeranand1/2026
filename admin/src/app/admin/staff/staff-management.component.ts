import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffOpsService } from '../../core/staff-ops.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-management.component.html',
  styleUrl: './staff-management.component.scss'
})
export class StaffManagementComponent implements OnInit {
  private staffOps = inject(StaffOpsService);

  staffList: any[] = [];
  isLoading = false;

  // Filter
  filterRole = '';
  filterStatus = '';
  searchQuery = '';

  // Modal
  showModal = false;
  newStaff: any = {
    name: '',
    mobile: '',
    email: '',
    password: '',
    role: 'field_officer',
    designation: 'Field Sourcing Officer',
    department: 'Operations',
    salary: 30000,
    dailyExpenseLimit: 2000,
    emergencyContact: '',
    assignedArea: {
      district: '',
      state: 'Uttar Pradesh'
    }
  };

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.filterRole) params.role = this.filterRole;
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.searchQuery) params.search = this.searchQuery;

    this.staffOps.getAllStaff(params).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.staffList = res.data;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Staff load error:', err);
      }
    });
  }

  openCreateModal(): void {
    this.newStaff = {
      name: '',
      mobile: '',
      email: '',
      password: '',
      role: 'field_officer',
      designation: 'Field Sourcing Officer',
      department: 'Operations',
      salary: 30000,
      dailyExpenseLimit: 2000,
      emergencyContact: '',
      assignedArea: {
        district: '',
        state: 'Uttar Pradesh'
      }
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onRolePresetChange(): void {
    switch (this.newStaff.role) {
      case 'hr':
        this.newStaff.designation = 'HR Manager';
        this.newStaff.department = 'Human Resources';
        break;
      case 'accountant':
        this.newStaff.designation = 'Finance Officer';
        this.newStaff.department = 'Finance';
        break;
      case 'ceo':
        this.newStaff.designation = 'Chief Executive Officer';
        this.newStaff.department = 'Executive';
        break;
      case 'cto':
        this.newStaff.designation = 'Chief Technology Officer';
        this.newStaff.department = 'Technology';
        break;
      case 'admin':
        this.newStaff.designation = 'Operations Administrator';
        this.newStaff.department = 'Operations';
        break;
      case 'field_officer':
        this.newStaff.designation = 'Field Sourcing Officer';
        this.newStaff.department = 'Operations';
        break;
      case 'investor':
        this.newStaff.designation = 'Strategic Investor';
        this.newStaff.department = 'Executive';
        break;
    }
  }

  createStaff(): void {
    if (!this.newStaff.name || !this.newStaff.mobile || !this.newStaff.password) {
      Swal.fire({
        title: 'Missing Details',
        text: 'Please enter Name, Mobile Number and Password.',
        icon: 'warning',
        confirmButtonColor: '#198754'
      });
      return;
    }

    this.staffOps.createStaff(this.newStaff).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            title: 'Employee Added!',
            text: `${res.data.name} added with role [${res.data.role.toUpperCase()}]`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadStaff();
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Failed to create staff member',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  toggleStatus(staff: any): void {
    const action = staff.status === 'active' ? 'suspend' : 'activate';
    Swal.fire({
      title: `${action.toUpperCase()} Employee?`,
      text: `Are you sure you want to ${action} ${staff.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'suspend' ? '#dc3545' : '#198754',
      confirmButtonText: `Yes, ${action}`
    }).then((result) => {
      if (result.isConfirmed) {
        this.staffOps.toggleStaffStatus(staff._id).subscribe({
          next: () => {
            this.loadStaff();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Action failed', 'error');
          }
        });
      }
    });
  }
}
