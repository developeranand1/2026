import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrainingService, Training } from '../../../core/training.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './training-detail.component.html',
  styleUrl: './training-detail.component.scss'
})
export class TrainingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trainingService = inject(TrainingService);

  trainingIdOrSlug: string = '';
  isLoading = true;
  training: Training | null = null;

  // Registration / Notification Form
  registrationForm = {
    name: '',
    phone: '',
    village: '',
    cropsGrown: ''
  };
  isSubmitting = false;
  isRegisteredSuccess = false;

  // Lightbox for photos
  isLightboxOpen = false;
  activeLightboxImg = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.trainingIdOrSlug = id;
        this.loadTrainingDetail(id);
      }
    });
  }

  loadTrainingDetail(idOrSlug: string): void {
    this.isLoading = true;
    this.trainingService.getTrainingByIdOrSlug(idOrSlug).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && res.data) {
          this.training = res.data;
          this.initFormDefaults();
        } else {
          this.training = null;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.training = null;
        console.error('Error loading training detail:', err);
      }
    });
  }

  private initFormDefaults(): void {
    if (this.training?.village) {
      this.registrationForm.village = this.training.village;
    }
  }

  submitRegistration(): void {
    if (!this.training) return;

    if (!this.registrationForm.name.trim() || !this.registrationForm.phone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'अधूरी जानकारी',
        text: 'कृपया अपना नाम और 10 अंकों का मोबाइल नंबर अवश्य भरें।',
        confirmButtonColor: '#198754'
      });
      return;
    }

    if (this.registrationForm.phone.replace(/\D/g, '').length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'गलत मोबाइल नंबर',
        text: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।',
        confirmButtonColor: '#198754'
      });
      return;
    }

    this.isSubmitting = true;

    const isCompleted = this.training.status === 'Completed';
    const trainingId = this.training._id || this.trainingIdOrSlug;

    this.trainingService.registerFarmer(trainingId, this.registrationForm).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isRegisteredSuccess = true;
        Swal.fire({
          icon: 'success',
          title: isCompleted ? '🎉 सूचना पंजीकृत!' : '🎉 बधाई हो! सीट आरक्षित हो गई',
          html: isCompleted
            ? `प्रिय <b>${this.registrationForm.name}</b> जी, जब भी <b>${this.training?.title}</b> का नया बैच आयोजित होगा, सूचना आपके मोबाइल <b>${this.registrationForm.phone}</b> पर भेज दी जाएगी।`
            : `प्रिय <b>${this.registrationForm.name}</b> जी, <b>${this.training?.title}</b> के लिए आपकी निःशुल्क सीट सफलतापूर्वक बुक हो गई है। विस्तृत सूचना आपके मोबाइल <b>${this.registrationForm.phone}</b> पर SMS/WhatsApp द्वारा भेज दी गई है।`,
          confirmButtonColor: '#198754',
          confirmButtonText: 'धन्यवाद'
        });

        if (!isCompleted && this.training) {
          this.training.registeredCount = (this.training.registeredCount || 0) + 1;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'त्रुटि',
          text: err.error?.message || 'पंजीकरण में समस्या आई। कृपया पुनः प्रयास करें।',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  openLightbox(imgUrl: string): void {
    this.activeLightboxImg = imgUrl;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.activeLightboxImg = '';
  }

  shareOnWhatsApp(): void {
    if (!this.training) return;
    const dateStr = new Date(this.training.startDate).toLocaleDateString('hi-IN');
    const msg = `🌾 *KrisiMarg किसान प्रशिक्षण शिविर सूचना* 🌾\n\n📌 *विषय:* ${this.training.title}\n📍 *स्थान:* ${this.training.village}, ${this.training.district} (${this.training.fullAddress})\n📅 *दिनांक:* ${dateStr}\n⏰ *समय:* ${this.training.time}\n👨‍🏫 *प्रशिक्षक:* ${this.training.trainerName}\n\nनिःशुल्क पंजीकरण हेतु यहाँ क्लिक करें:\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }

  getGoogleMapsUrl(): string {
    if (!this.training) return '#';
    const query = encodeURIComponent(`${this.training.village}, ${this.training.district}, ${this.training.fullAddress}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}
