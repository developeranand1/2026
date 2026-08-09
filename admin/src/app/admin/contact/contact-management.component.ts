import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminContactService, ContactInquiry } from '../../core/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './contact-management.component.html',
  styleUrl: './contact-management.component.scss'
})
export class ContactManagementComponent implements OnInit {
  private contactService = inject(AdminContactService);

  inquiries: ContactInquiry[] = [];
  stats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    contacted: 0,
    resolved: 0
  };

  selectedStatusFilter = 'All';
  searchTerm = '';
  isLoading = false;

  // Drawer / Modal state
  selectedInquiry: ContactInquiry | null = null;
  editStatus = 'Pending';
  editRemark = '';
  isSaving = false;

  // Toast / Notification
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';

  statusOptions = ['Pending', 'In Progress', 'Contacted', 'Resolved', 'Closed'];

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.isLoading = true;
    this.contactService.getInquiries(this.selectedStatusFilter, this.searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.inquiries = res.data;
          this.stats = res.stats;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('Failed to load contact inquiries', 'danger');
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatusFilter = status;
    this.loadInquiries();
  }

  onSearch(): void {
    this.loadInquiries();
  }

  openDetailModal(inquiry: ContactInquiry): void {
    this.selectedInquiry = inquiry;
    this.editStatus = inquiry.status || 'Pending';
    this.editRemark = inquiry.adminRemark || '';
  }

  closeModal(): void {
    this.selectedInquiry = null;
    this.editRemark = '';
  }

  saveInquiryChanges(): void {
    if (!this.selectedInquiry) return;

    this.isSaving = true;
    this.contactService.updateInquiry(this.selectedInquiry._id, this.editStatus, this.editRemark).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Inquiry status and remark saved successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          if (this.selectedInquiry) {
            this.selectedInquiry.status = res.data.status;
            this.selectedInquiry.adminRemark = res.data.adminRemark;
            this.selectedInquiry.contactedAt = res.data.contactedAt;
          }
          this.closeModal();
          this.loadInquiries();
        }
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire('Error', err.error?.message || 'Failed to update inquiry', 'error');
      }
    });
  }

  deleteInquiry(inquiry: ContactInquiry, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Delete Inquiry?',
      text: `Are you sure you want to delete inquiry from "${inquiry.fullName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contactService.deleteInquiry(inquiry._id).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Inquiry deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            if (this.selectedInquiry && this.selectedInquiry._id === inquiry._id) {
              this.closeModal();
            }
            this.loadInquiries();
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete inquiry', 'error');
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'In Progress': return 'bg-info text-dark';
      case 'Contacted': return 'bg-primary text-white';
      case 'Resolved': return 'bg-success text-white';
      case 'Closed': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }

  private showToast(msg: string, type: 'success' | 'danger' = 'success'): void {
    Swal.fire({
      icon: type === 'success' ? 'success' : 'error',
      title: type === 'success' ? 'Success' : 'Notice',
      text: msg,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  }
}
