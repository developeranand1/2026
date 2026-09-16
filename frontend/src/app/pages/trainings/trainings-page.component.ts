import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainingService, Training } from '../../core/training.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trainings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainings-page.component.html',
  styleUrl: './trainings-page.component.scss'
})
export class TrainingsPageComponent implements OnInit {
  private trainingService = inject(TrainingService);

  activeTab: 'upcoming' | 'completed' = 'upcoming';
  isLoading = true;
  trainings: Training[] = [];
  selectedCategory = 'All';
  searchQuery = '';

  stats = {
    totalTrainings: 24,
    upcomingCount: 6,
    completedCount: 18,
    farmersTrained: 5420
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

  // Registration Modal State
  isRegisterModalOpen = false;
  selectedTrainingForRegister: Training | null = null;
  registrationForm = {
    name: '',
    phone: '',
    village: '',
    cropsGrown: ''
  };
  isSubmittingRegistration = false;

  // Detail Modal State
  isDetailModalOpen = false;
  activeTrainingDetail: Training | null = null;

  // Photo Lightbox State
  isLightboxOpen = false;
  activeLightboxImage = '';

  ngOnInit(): void {
    this.loadTrainings();
    this.loadStats();
  }

  setTab(tab: 'upcoming' | 'completed'): void {
    this.activeTab = tab;
    this.loadTrainings();
  }

  loadStats(): void {
    this.trainingService.getTrainingStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = {
            totalTrainings: res.data.total || 24,
            upcomingCount: res.data.upcoming || 6,
            completedCount: res.data.completed || 18,
            farmersTrained: res.data.totalCertified ? res.data.totalCertified * 25 : 5420
          };
        }
      },
      error: () => {}
    });
  }

  loadTrainings(): void {
    this.isLoading = true;
    const statusQuery = this.activeTab === 'upcoming' ? 'Upcoming' : 'Completed';

    this.trainingService.getAllTrainings(
      statusQuery,
      this.selectedCategory,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.trainings = res.data || [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching trainings:', err);
      }
    });
  }

  onFilterChange(): void {
    this.loadTrainings();
  }

  // Registration modal triggers
  openRegisterModal(training: Training): void {
    this.selectedTrainingForRegister = training;
    this.registrationForm = {
      name: '',
      phone: '',
      village: training.village || '',
      cropsGrown: ''
    };
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
    this.selectedTrainingForRegister = null;
  }

  submitRegistration(): void {
    if (!this.selectedTrainingForRegister || !this.selectedTrainingForRegister._id) return;

    if (!this.registrationForm.name || !this.registrationForm.phone) {
      Swal.fire('अधूरी जानकारी', 'कृपया अपना नाम और मोबाइल नंबर अवश्य दर्ज करें।', 'warning');
      return;
    }

    if (this.registrationForm.phone.length < 10) {
      Swal.fire('गलत नंबर', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।', 'warning');
      return;
    }

    this.isSubmittingRegistration = true;

    this.trainingService.registerFarmer(this.selectedTrainingForRegister._id, this.registrationForm).subscribe({
      next: (res) => {
        this.isSubmittingRegistration = false;
        if (res.success) {
          Swal.fire({
            title: '🎉 बधाई हो! पंजीकरण सफल रहा',
            html: `प्रिय <b>${this.registrationForm.name}</b> जी, <b>${this.selectedTrainingForRegister?.village}</b> में होने वाले प्रशिक्षण के लिए आपकी निःशुल्क सीट आरक्षित कर ली गई है। विवरण आपके मोबाइल <b>${this.registrationForm.phone}</b> पर भेज दिया गया है।`,
            icon: 'success',
            confirmButtonColor: '#2E7D32',
            confirmButtonText: 'ठीक है (OK)'
          });
          this.closeRegisterModal();
          this.loadTrainings();
        }
      },
      error: (err) => {
        this.isSubmittingRegistration = false;
        Swal.fire('त्रुटि', err.error?.message || 'पंजीकरण में समस्या आई। कृपया पुनः प्रयास करें।', 'error');
      }
    });
  }

  // Detail modal triggers
  openDetailModal(training: Training): void {
    this.activeTrainingDetail = training;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.activeTrainingDetail = null;
  }

  // Photo lightbox
  openLightbox(imageUrl: string): void {
    this.activeLightboxImage = imageUrl;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.activeLightboxImage = '';
  }

  // WhatsApp Share
  shareOnWhatsApp(training: Training): void {
    const text = `🌾 *KrisiMarg किसान प्रशिक्षण शिविर सूचना* 🌾\n\n📌 *विषय:* ${training.title}\n📍 *स्थान / गांव:* ${training.village}, ${training.district} (${training.fullAddress})\n📅 *दिनांक:* ${new Date(training.startDate).toLocaleDateString('hi-IN')}\n⏰ *समय:* ${training.time}\n👨‍🏫 *प्रशिक्षक:* ${training.trainerName}\n\nनिःशुल्क पंजीकरण हेतु यहाँ क्लिक करें: https://krisimarg.com/trainings`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
