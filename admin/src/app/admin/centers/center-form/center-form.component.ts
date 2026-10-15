import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CenterService, Center, CenterWorker } from '../../../core/center.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-center-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './center-form.component.html',
  styleUrl: './center-form.component.scss'
})
export class CenterFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private centerService = inject(CenterService);

  isEditing = false;
  centerId: string | null = null;
  isLoading = false;
  isSaving = false;

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

  imagePreview: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.centerId = params.get('id');
      if (this.centerId) {
        this.isEditing = true;
        this.loadCenter(this.centerId);
      }
    });
  }

  // Quick Worker Input Model
  newWorker: {
    name: string;
    role: string;
    contactNumber: string;
    email: string;
    status: 'active' | 'inactive';
  } = {
    name: '',
    role: 'Weighing Operator (तौल ऑपरेटर)',
    contactNumber: '',
    email: '',
    status: 'active'
  };

  commonWorkerRoles = [
    'Weighing Operator (तौल ऑपरेटर)',
    'Field Officer (फील्ड ऑफिसर)',
    'Computer Operator (कंप्यूटर ऑपरेटर)',
    'Billing & Cashier (बिलिंग व कैशियर)',
    'Quality Inspector (गुणवत्ता परीक्षक)',
    'Storage In-charge (गोदाम प्रभारी)',
    'General Worker / Helper (सहायक)'
  ];

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
      workers: [] as CenterWorker[],
      status: 'active' as 'active' | 'inactive'
    };
  }

  loadCenter(id: string): void {
    this.isLoading = true;
    this.centerService.getCenterById(id).subscribe({
      next: (res) => {
        const c = res.data;
        this.formData = {
          centerName: c.centerName,
          image: c.image || '',
          address: c.address,
          pinCode: c.pinCode,
          openingTime: c.openingTime || '09:00 AM - 06:00 PM',
          helplineNumber: c.helplineNumber,
          director: {
            name: c.director.name,
            contactNumber: c.director.contactNumber || '',
            email: c.director.email || '',
            designation: c.director.designation || 'Center Director / Head'
          },
          helpingStaff: {
            name: c.helpingStaff?.name || '',
            contactNumber: c.helpingStaff?.contactNumber || '',
            role: c.helpingStaff?.role || 'Assistant / Coordinator'
          },
          workers: c.workers ? JSON.parse(JSON.stringify(c.workers)) : [],
          status: c.status || 'active'
        };
        this.imagePreview = c.image || null;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load center details' });
        this.router.navigate(['/admin/centers']);
      }
    });
  }

  addWorkerFromInput(): void {
    if (!this.newWorker.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Worker Name Required',
        text: 'Please enter the worker name',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    this.formData.workers.push({
      name: this.newWorker.name.trim(),
      role: this.newWorker.role.trim() || 'Worker',
      contactNumber: this.newWorker.contactNumber.trim(),
      email: this.newWorker.email.trim(),
      status: this.newWorker.status
    });

    // Reset new worker input
    this.newWorker = {
      name: '',
      role: 'Weighing Operator (तौल ऑपरेटर)',
      contactNumber: '',
      email: '',
      status: 'active'
    };
  }

  removeWorker(index: number): void {
    this.formData.workers.splice(index, 1);
  }

  getWorkerInitials(name: string): string {
    if (!name) return 'W';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({ icon: 'warning', title: 'File Too Large', text: 'Max size 10MB' });
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

  saveCenter(): void {
    if (!this.formData.centerName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Center Name is required' });
      return;
    }
    if (!this.formData.address.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Address is required' });
      return;
    }
    if (!this.formData.pinCode.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Pin Code is required' });
      return;
    }
    if (!this.formData.helplineNumber.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Helpline Number is required' });
      return;
    }
    if (!this.formData.director.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Director / In-charge Name is required' });
      return;
    }

    const validWorkers = this.formData.workers.filter(w => w.name && w.name.trim().length > 0);
    const payload = { ...this.formData, workers: validWorkers };

    this.isSaving = true;

    if (this.isEditing && this.centerId) {
      this.centerService.updateCenter(this.centerId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated',
            text: 'Center updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/admin/centers', this.centerId]);
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire({ icon: 'error', title: 'Update Failed', text: err?.error?.message || 'Could not update center' });
        }
      });
    } else {
      this.centerService.createCenter(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          Swal.fire({
            icon: 'success',
            title: 'Created',
            text: 'New Center created successfully',
            timer: 1800,
            showConfirmButton: false
          });
          if (res.data && res.data._id) {
            this.router.navigate(['/admin/centers', res.data._id]);
          } else {
            this.router.navigate(['/admin/centers']);
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.message || 'Could not create center' });
        }
      });
    }
  }
}
