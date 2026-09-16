import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminTrainingService, Training, Participant } from '../../core/training.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-training-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './training-management.component.html',
  styleUrl: './training-management.component.scss'
})
export class TrainingManagementComponent implements OnInit {
  private trainingService = inject(AdminTrainingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // View state: 'list' | 'form' | 'details'
  viewMode: 'list' | 'form' | 'details' = 'list';

  trainings: Training[] = [];
  isLoading = true;
  isSaving = false;
  selectedStatusFilter = 'All';
  selectedCategoryFilter = 'All';
  searchQuery = '';

  // Stats
  stats = {
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    totalFarmersTrained: 0
  };

  categories = [
    'Organic Farming',
    'Crop Protection & Pest Management',
    'Drip Irrigation & Water Tech',
    'Dairy & Animal Husbandry',
    'Govt Schemes & Subsidies',
    'Mandi Trading & Digital Literacy',
    'Soil Health & Fertilizer',
    'Horticulture & Fruits',
    'General Training'
  ];

  // Toast
  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' = 'success';

  // Form State
  isEditMode = false;
  currentTrainingId = '';

  formData: any = {
    title: '',
    category: 'Organic Farming',
    trainerName: '',
    trainerDesignation: 'Krishi Vigyan Expert',
    organizer: 'KrisiMarg Kisan Training Mission',
    village: '',
    district: '',
    state: 'Uttar Pradesh',
    fullAddress: '',
    startDate: '',
    endDate: '',
    time: '10:00 AM - 02:00 PM',
    duration: '1 Day (4 Hours)',
    description: '',
    topicsInput: '',
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [] as string[],
    newGalleryUrl: '',
    status: 'Upcoming',
    maxCapacity: 50,
    fee: 'Free / निःशुल्क',
    contactPerson: 'KrisiMarg Training Desk',
    contactPhone: '9125955106',
    successSummary: '',
    keyAchievementsInput: '',
    isFeatured: false
  };

  // Details Page State
  activeTraining: Training | null = null;
  newParticipant = {
    name: '',
    village: '',
    phone: '',
    cropsGrown: '',
    status: 'Attended' as 'Registered' | 'Attended' | 'Certified'
  };

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      const url = this.router.url;
      const params = this.route.snapshot.params;

      if (url.includes('/trainings/create')) {
        this.viewMode = 'form';
        this.initCreateForm();
      } else if (url.includes('/trainings/edit/')) {
        const id = params['id'] || url.split('/trainings/edit/')[1];
        this.viewMode = 'form';
        if (id) {
          this.loadTrainingForEdit(id);
        }
      } else if (url.includes('/trainings/view/')) {
        const id = params['id'] || url.split('/trainings/view/')[1];
        this.viewMode = 'details';
        if (id) {
          this.loadTrainingDetails(id);
        }
      } else {
        this.viewMode = 'list';
        this.loadTrainings();
      }
    });
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }

  loadTrainings(): void {
    this.isLoading = true;
    this.trainingService.getTrainings(
      this.selectedStatusFilter,
      this.selectedCategoryFilter,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.trainings = res.data || [];
          if (res.stats) {
            this.stats = res.stats;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading trainings:', err);
        this.showToast('Failed to load training events', 'danger');
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatusFilter = status;
    this.loadTrainings();
  }

  onFilterChange(): void {
    this.loadTrainings();
  }

  // Navigation handlers
  navigateToList(): void {
    this.router.navigate(['/admin/trainings']);
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/trainings/create']);
  }

  navigateToEdit(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/admin/trainings/edit', id]);
    }
  }

  navigateToDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/admin/trainings/view', id]);
    }
  }

  initCreateForm(): void {
    this.isEditMode = false;
    this.currentTrainingId = '';
    const todayStr = new Date().toISOString().split('T')[0];

    this.formData = {
      title: '',
      category: 'Organic Farming',
      trainerName: '',
      trainerDesignation: 'Krishi Vigyan Expert',
      organizer: 'KrisiMarg Kisan Training Mission',
      village: '',
      district: '',
      state: 'Uttar Pradesh',
      fullAddress: '',
      startDate: todayStr,
      endDate: todayStr,
      time: '10:00 AM - 02:00 PM',
      duration: '1 Day (4 Hours)',
      description: '',
      topicsInput: '',
      coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
      galleryImages: [],
      newGalleryUrl: '',
      status: 'Upcoming',
      maxCapacity: 50,
      fee: 'Free / निःशुल्क',
      contactPerson: 'KrisiMarg Training Desk',
      contactPhone: '9125955106',
      successSummary: '',
      keyAchievementsInput: '',
      isFeatured: false
    };
  }

  loadTrainingForEdit(id: string): void {
    this.isLoading = true;
    this.isEditMode = true;
    this.currentTrainingId = id;

    this.trainingService.getTrainingById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const t = res.data;
          const formattedStartDate = t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '';
          const formattedEndDate = t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : formattedStartDate;

          this.formData = {
            title: t.title,
            category: t.category,
            trainerName: t.trainerName,
            trainerDesignation: t.trainerDesignation || 'Krishi Vigyan Expert',
            organizer: t.organizer || 'KrisiMarg Kisan Training Mission',
            village: t.village,
            district: t.district,
            state: t.state || 'Uttar Pradesh',
            fullAddress: t.fullAddress,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            time: t.time || '10:00 AM - 02:00 PM',
            duration: t.duration || '1 Day (4 Hours)',
            description: t.description,
            topicsInput: t.topics ? t.topics.join(', ') : '',
            coverImage: t.coverImage || '',
            galleryImages: t.galleryImages ? [...t.galleryImages] : [],
            newGalleryUrl: '',
            status: t.status,
            maxCapacity: t.maxCapacity || 50,
            fee: t.fee || 'Free / निःशुल्क',
            contactPerson: t.contactPerson || 'KrisiMarg Training Desk',
            contactPhone: t.contactPhone || '9125955106',
            successSummary: t.successSummary || '',
            keyAchievementsInput: t.keyAchievements ? t.keyAchievements.join(', ') : '',
            isFeatured: !!t.isFeatured
          };
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching training for edit:', err);
        Swal.fire('Error', 'Could not load training details for editing', 'error');
        this.navigateToList();
      }
    });
  }

  loadTrainingDetails(id: string): void {
    this.isLoading = true;
    this.trainingService.getTrainingById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.activeTraining = res.data;
          this.newParticipant = {
            name: '',
            village: this.activeTraining.village || '',
            phone: '',
            cropsGrown: '',
            status: 'Attended'
          };
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading training details:', err);
        Swal.fire('Error', 'Training details not found', 'error');
        this.navigateToList();
      }
    });
  }

  // Form image handlers
  onCoverImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('File too large', 'Please choose an image under 10MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.coverImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onGalleryFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.formData.galleryImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  addGalleryUrl(): void {
    if (this.formData.newGalleryUrl && this.formData.newGalleryUrl.trim()) {
      this.formData.galleryImages.push(this.formData.newGalleryUrl.trim());
      this.formData.newGalleryUrl = '';
    }
  }

  removeGalleryImage(index: number): void {
    this.formData.galleryImages.splice(index, 1);
  }

  saveTraining(): void {
    if (!this.formData.title || !this.formData.village || !this.formData.district || !this.formData.startDate) {
      Swal.fire('Missing Information', 'Please fill in Title, Village, District, and Start Date.', 'warning');
      return;
    }

    this.isSaving = true;

    const payload: any = {
      title: this.formData.title,
      category: this.formData.category,
      trainerName: this.formData.trainerName,
      trainerDesignation: this.formData.trainerDesignation,
      organizer: this.formData.organizer,
      village: this.formData.village,
      district: this.formData.district,
      state: this.formData.state,
      fullAddress: this.formData.fullAddress,
      startDate: this.formData.startDate,
      endDate: this.formData.endDate || this.formData.startDate,
      time: this.formData.time,
      duration: this.formData.duration,
      description: this.formData.description,
      topics: this.formData.topicsInput ? this.formData.topicsInput.split(',').map((t: string) => t.trim()) : [],
      coverImage: this.formData.coverImage,
      galleryImages: this.formData.galleryImages,
      status: this.formData.status,
      maxCapacity: Number(this.formData.maxCapacity) || 50,
      fee: this.formData.fee,
      contactPerson: this.formData.contactPerson,
      contactPhone: this.formData.contactPhone,
      successSummary: this.formData.successSummary,
      keyAchievements: this.formData.keyAchievementsInput ? this.formData.keyAchievementsInput.split(',').map((a: string) => a.trim()) : [],
      isFeatured: this.formData.isFeatured
    };

    if (this.isEditMode) {
      this.trainingService.updateTraining(this.currentTrainingId, payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            Swal.fire('Updated!', 'Training session updated successfully.', 'success');
            this.navigateToList();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('Error', err.error?.message || 'Failed to update training', 'error');
        }
      });
    } else {
      this.trainingService.createTraining(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            Swal.fire('Created!', 'New Training Camp scheduled successfully.', 'success');
            this.navigateToList();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('Error', err.error?.message || 'Failed to create training', 'error');
        }
      });
    }
  }

  // Quick Status Update on Details Page
  changeActiveTrainingStatus(newStatus: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'): void {
    if (!this.activeTraining || !this.activeTraining._id) return;

    if (newStatus === 'Completed') {
      Swal.fire({
        title: 'Mark as Successfully Completed?',
        text: 'Enter a brief summary of the successful session outcomes:',
        input: 'textarea',
        inputValue: this.activeTraining.successSummary || `सत्र सफलतापूर्वक संपन्न हुआ। कुल ${this.activeTraining.participants?.length || 45} किसान भाइयों ने प्रायोगिक प्रशिक्षण प्राप्त किया।`,
        showCancelButton: true,
        confirmButtonColor: '#2E7D32',
        confirmButtonText: 'Yes, Mark as Successful'
      }).then((result) => {
        if (result.isConfirmed) {
          const payload: Partial<Training> = {
            status: 'Completed',
            successSummary: result.value || 'सत्र सफलतापूर्वक संपन्न हुआ।'
          };
          this.trainingService.updateTraining(this.activeTraining!._id!, payload).subscribe({
            next: (res) => {
              if (res.success) {
                Swal.fire('Session Completed!', 'The training session is now marked as Completed.', 'success');
                this.loadTrainingDetails(this.activeTraining!._id!);
              }
            }
          });
        }
      });
    } else {
      this.trainingService.updateTraining(this.activeTraining._id, { status: newStatus }).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast(`Status changed to ${newStatus}`, 'success');
            this.loadTrainingDetails(this.activeTraining!._id!);
          }
        }
      });
    }
  }

  // Details Page: Upload Photos to Gallery
  onDetailGalleryPhotoSelected(event: any): void {
    if (!this.activeTraining || !this.activeTraining._id) return;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const currentGallery = this.activeTraining?.galleryImages ? [...this.activeTraining.galleryImages] : [];
        currentGallery.push(e.target.result);
        
        this.trainingService.updateTraining(this.activeTraining!._id!, { galleryImages: currentGallery }).subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Event photo uploaded to gallery!', 'success');
              this.loadTrainingDetails(this.activeTraining!._id!);
            }
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Attendees & Participant actions on Details Page
  addManualParticipant(): void {
    if (!this.activeTraining || !this.activeTraining._id) return;
    if (!this.newParticipant.name || !this.newParticipant.phone) {
      Swal.fire('Incomplete', 'Please enter Farmer Name and Phone Number', 'warning');
      return;
    }

    this.trainingService.addParticipant(this.activeTraining._id, this.newParticipant).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Farmer participant added!', 'success');
          this.newParticipant = {
            name: '',
            village: this.activeTraining?.village || '',
            phone: '',
            cropsGrown: '',
            status: 'Attended'
          };
          this.loadTrainingDetails(this.activeTraining!._id!);
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to add participant', 'error');
      }
    });
  }

  removeParticipant(participantId: string | undefined): void {
    if (!this.activeTraining || !this.activeTraining._id || !participantId) return;

    this.trainingService.deleteParticipant(this.activeTraining._id, participantId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Participant removed', 'warning');
          this.loadTrainingDetails(this.activeTraining!._id!);
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to remove participant', 'error');
      }
    });
  }

  deleteTraining(training: Training): void {
    Swal.fire({
      title: 'Delete Training Event?',
      text: `Are you sure you want to delete "${training.title}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed && training._id) {
        this.trainingService.deleteTraining(training._id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The training has been deleted.', 'success');
            if (this.viewMode === 'details') {
              this.navigateToList();
            } else {
              this.loadTrainings();
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to delete training', 'error');
          }
        });
      }
    });
  }

  seedDemoData(): void {
    Swal.fire({
      title: 'Seed Demo Training Sessions?',
      text: 'This will seed sample Upcoming & Successful Completed training camps with real photos & village details.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E7D32',
      confirmButtonText: 'Yes, Seed Data'
    }).then((res) => {
      if (res.isConfirmed) {
        this.trainingService.seedDemoTrainings().subscribe({
          next: () => {
            Swal.fire('Success!', 'Demo training events seeded successfully.', 'success');
            this.loadTrainings();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to seed data', 'error');
          }
        });
      }
    });
  }

  printAttendeeList(): void {
    window.print();
  }
}
