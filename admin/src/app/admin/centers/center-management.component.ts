import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CenterService, Center, CenterWorker } from '../../core/center.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-center-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './center-management.component.html',
  styleUrl: './center-management.component.scss'
})
export class CenterManagementComponent implements OnInit {
  private centerService = inject(CenterService);

  centers: Center[] = [];
  filteredCenters: Center[] = [];
  isLoading = true;
  isSaving = false;

  // Search & Filter & View
  searchQuery = '';
  selectedStatus = 'all';
  currentView: 'table' | 'cards' = 'table';

  // Common Roles for workers
  commonWorkerRoles = [
    'Weighing Operator (तौल ऑपरेटर)',
    'Field Officer (फील्ड ऑफिसर)',
    'Computer Operator (कंप्यूटर ऑपरेटर)',
    'Billing & Cashier (बिलिंग व कैशियर)',
    'Quality Inspector (गुणवत्ता परीक्षक)',
    'Storage In-charge (गोदाम प्रभारी)',
    'General Worker / Helper (सहायक)'
  ];

  // Modal State for Center (Add / Edit)
  showCenterModal = false;
  isEditing = false;
  editingCenterId: string | null = null;

  // Modal State for Quick Workers Management
  showWorkersModal = false;
  selectedCenterForWorkers: Center | null = null;
  newWorkerData: Partial<CenterWorker> = {
    name: '',
    role: 'Weighing Operator (तौल ऑपरेटर)',
    contactNumber: '',
    email: '',
    status: 'active'
  };

  // Center Form Model
  formData: {
    centerName: string;
    image: string;
    address: string;
    pinCode: string;
    openingTime: string;
    helplineNumber: string;
    director: {
      name: string;
      contactNumber: string;
      email: string;
      designation: string;
    };
    helpingStaff: {
      name: string;
      contactNumber: string;
      role: string;
    };
    workers: CenterWorker[];
    status: 'active' | 'inactive';
  } = this.getEmptyForm();

  // Image Upload Preview
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.loadCenters();
  }

  getEmptyForm() {
    return {
      centerName: '',
      image: '',
      address: '',
      pinCode: '',
      openingTime: '09:00 AM - 06:00 PM',
      helplineNumber: '',
      director: {
        name: '',
        contactNumber: '',
        email: '',
        designation: 'Center Director / Head'
      },
      helpingStaff: {
        name: '',
        contactNumber: '',
        role: 'Assistant / Coordinator'
      },
      workers: [
        {
          name: '',
          role: 'Field Worker',
          contactNumber: '',
          email: '',
          status: 'active' as 'active' | 'inactive'
        }
      ] as CenterWorker[],
      status: 'active' as 'active' | 'inactive'
    };
  }

  loadCenters(): void {
    this.isLoading = true;
    this.centerService.getCenters({
      search: this.searchQuery,
      status: this.selectedStatus === 'all' ? undefined : this.selectedStatus
    }).subscribe({
      next: (res) => {
        this.centers = res.data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load centers:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Centers',
          text: err?.error?.message || 'Failed to fetch centers from server'
        });
      }
    });
  }

  applyFilter(): void {
    let list = [...this.centers];

    if (this.selectedStatus !== 'all') {
      list = list.filter(c => c.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.centerName?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.pinCode?.toLowerCase().includes(q) ||
        c.director?.name?.toLowerCase().includes(q) ||
        c.helpingStaff?.name?.toLowerCase().includes(q) ||
        c.workers?.some(w => w.name?.toLowerCase().includes(q))
      );
    }

    this.filteredCenters = list;
  }

  // Calculate metrics
  get totalCenters(): number {
    return this.centers.length;
  }

  get activeCenters(): number {
    return this.centers.filter(c => c.status === 'active').length;
  }

  get totalWorkersCount(): number {
    return this.centers.reduce((acc, c) => acc + (c.workers?.length || 0), 0);
  }

  get uniquePincodesCount(): number {
    const pins = new Set(this.centers.map(c => c.pinCode).filter(Boolean));
    return pins.size;
  }

  // Open modal to add center
  openAddModal(): void {
    this.isEditing = false;
    this.editingCenterId = null;
    this.formData = this.getEmptyForm();
    this.imagePreview = null;
    this.showCenterModal = true;
  }

  // Open modal to edit center
  openEditModal(center: Center): void {
    this.isEditing = true;
    this.editingCenterId = center._id || null;
    this.formData = {
      centerName: center.centerName,
      image: center.image || '',
      address: center.address,
      pinCode: center.pinCode,
      openingTime: center.openingTime || '09:00 AM - 06:00 PM',
      helplineNumber: center.helplineNumber,
      director: {
        name: center.director?.name || '',
        contactNumber: center.director?.contactNumber || '',
        email: center.director?.email || '',
        designation: center.director?.designation || 'Center Director / Head'
      },
      helpingStaff: {
        name: center.helpingStaff?.name || '',
        contactNumber: center.helpingStaff?.contactNumber || '',
        role: center.helpingStaff?.role || 'Assistant / Coordinator'
      },
      workers: center.workers && center.workers.length > 0
        ? JSON.parse(JSON.stringify(center.workers))
        : [{ name: '', role: 'Field Worker', contactNumber: '', email: '', status: 'active' }],
      status: center.status || 'active'
    };
    this.imagePreview = center.image || null;
    this.showCenterModal = true;
  }

  closeCenterModal(): void {
    this.showCenterModal = false;
  }

  // Add new worker row to form
  addWorkerRow(): void {
    this.formData.workers.push({
      name: '',
      role: 'Worker',
      contactNumber: '',
      email: '',
      status: 'active' as 'active' | 'inactive'
    });
  }

  // Remove worker row from form
  removeWorkerRow(index: number): void {
    this.formData.workers.splice(index, 1);
  }

  // Handle Image Selection
  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'Image size should be less than 10MB'
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.formData.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.formData.image = '';
  }

  // Save Center (Create or Update)
  saveCenter(): void {
    if (!this.formData.centerName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please enter Center Name' });
      return;
    }
    if (!this.formData.address.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please enter Address' });
      return;
    }
    if (!this.formData.pinCode.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please enter Pin Code' });
      return;
    }
    if (!this.formData.helplineNumber.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please enter Helpline Number' });
      return;
    }
    if (!this.formData.director.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please enter Director / Main Head Name' });
      return;
    }

    // Filter out workers without a name
    const validWorkers = this.formData.workers.filter(w => w.name && w.name.trim().length > 0);

    const payload = {
      ...this.formData,
      workers: validWorkers
    };

    this.isSaving = true;

    if (this.isEditing && this.editingCenterId) {
      this.centerService.updateCenter(this.editingCenterId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showCenterModal = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated Successfully',
            text: 'Center details have been updated',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadCenters();
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err?.error?.message || 'Could not update center'
          });
        }
      });
    } else {
      this.centerService.createCenter(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showCenterModal = false;
          Swal.fire({
            icon: 'success',
            title: 'Created Successfully',
            text: 'New Center has been created with Director, Helper, and Workers',
            timer: 2500,
            showConfirmButton: false
          });
          this.loadCenters();
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: err?.error?.message || 'Could not create center'
          });
        }
      });
    }
  }

  // Delete Center
  deleteCenter(center: Center): void {
    Swal.fire({
      title: `Delete Center?`,
      text: `Are you sure you want to delete "${center.centerName}"? All workers associated with this center will also be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed && center._id) {
        this.centerService.deleteCenter(center._id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Center has been deleted',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadCenters();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: err?.error?.message || 'Could not delete center'
            });
          }
        });
      }
    });
  }

  // Quick Workers Management Modal
  openWorkersModal(center: Center): void {
    this.selectedCenterForWorkers = center;
    this.newWorkerData = {
      name: '',
      role: 'Worker',
      contactNumber: '',
      email: '',
      status: 'active'
    };
    this.showWorkersModal = true;
  }

  closeWorkersModal(): void {
    this.showWorkersModal = false;
    this.selectedCenterForWorkers = null;
  }

  // Add Worker directly from Quick Workers Modal
  addWorkerToSelectedCenter(): void {
    if (!this.selectedCenterForWorkers?._id) return;
    if (!this.newWorkerData.name?.trim()) {
      Swal.fire({ icon: 'warning', title: 'Worker Name Required', text: 'Please enter the worker name' });
      return;
    }

    this.centerService.addWorker(this.selectedCenterForWorkers._id, this.newWorkerData).subscribe({
      next: (res) => {
        if (this.selectedCenterForWorkers) {
          if (!this.selectedCenterForWorkers.workers) {
            this.selectedCenterForWorkers.workers = [];
          }
          if (res.data) {
            this.selectedCenterForWorkers.workers.push(res.data);
          }
        }
        this.newWorkerData = {
          name: '',
          role: 'Worker',
          contactNumber: '',
          email: '',
          status: 'active'
        };
        Swal.fire({
          icon: 'success',
          title: 'Worker Added',
          text: 'New worker has been added to this center',
          timer: 1800,
          showConfirmButton: false
        });
        this.loadCenters();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Add Worker',
          text: err?.error?.message || 'Could not add worker'
        });
      }
    });
  }

  // Remove worker from center
  removeWorkerFromSelectedCenter(workerId: string): void {
    if (!this.selectedCenterForWorkers?._id || !workerId) return;

    Swal.fire({
      title: 'Remove Worker?',
      text: 'Are you sure you want to remove this worker from the center?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Remove'
    }).then((result) => {
      if (result.isConfirmed) {
        this.centerService.removeWorker(this.selectedCenterForWorkers!._id!, workerId).subscribe({
          next: () => {
            if (this.selectedCenterForWorkers && this.selectedCenterForWorkers.workers) {
              this.selectedCenterForWorkers.workers = this.selectedCenterForWorkers.workers.filter(w => w._id !== workerId);
            }
            Swal.fire({
              icon: 'success',
              title: 'Worker Removed',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadCenters();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Failed to Remove',
              text: err?.error?.message || 'Could not remove worker'
            });
          }
        });
      }
    });
  }

  getWorkerInitials(name: string): string {
    if (!name) return 'W';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
