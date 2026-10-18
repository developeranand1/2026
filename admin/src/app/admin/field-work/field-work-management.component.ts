import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffOpsService } from '../../core/staff-ops.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-field-work-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-work-management.component.html',
  styleUrl: './field-work-management.component.scss'
})
export class FieldWorkManagementComponent implements OnInit {
  private staffOps = inject(StaffOpsService);

  sessions: any[] = [];
  isLoading = false;

  filterDate = '';
  filterStatus = '';

  ngOnInit(): void {
    this.loadFieldWork();
  }

  loadFieldWork(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.filterDate) params.date = this.filterDate;
    if (this.filterStatus) params.status = this.filterStatus;

    this.staffOps.getAllFieldWork(params).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.sessions = res.data;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Field work load error:', err);
      }
    });
  }

  getGoogleMapsUrl(loc: any): string {
    if (!loc || loc.latitude === undefined || loc.longitude === undefined) return '#';
    return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
  }

  verifySession(session: any): void {
    Swal.fire({
      title: 'Verify Field Shift?',
      text: `Confirm GPS check-in & work report for ${session.staff?.name || 'Staff'}`,
      input: 'text',
      inputPlaceholder: 'Optional HR verification remarks...',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      confirmButtonText: 'Verify Shift'
    }).then((result) => {
      if (result.isConfirmed) {
        this.staffOps.verifyFieldWork(session._id, result.value || 'Verified by HR').subscribe({
          next: () => {
            Swal.fire({
              title: 'Verified!',
              text: 'Field work session marked as verified.',
              icon: 'success',
              timer: 1200,
              showConfirmButton: false
            });
            this.loadFieldWork();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Verification failed', 'error');
          }
        });
      }
    });
  }
}
