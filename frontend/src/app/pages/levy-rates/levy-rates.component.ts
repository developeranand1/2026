import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LevyRateService, LevyRate } from '../../core/levy-rate.service';
import { AuthService } from '../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-levy-rates',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './levy-rates.component.html',
  styleUrl: './levy-rates.component.scss'
})
export class LevyRatesPageComponent implements OnInit {
  private levyService = inject(LevyRateService);
  private authService = inject(AuthService);

  isLoading = false;
  isSaving = false;
  showFormModal = false;
  showDetailsModal = false;
  selectedRateForDetails: LevyRate | null = null;
  calcQuantity: number = 50; // default 50 quintals for calculation

  isEditing = false;
  editingId: string | null = null;

  // Admin access control
  isAdmin = false;
  showAdminLoginModal = false;
  adminPinInput = '';

  searchQuery = '';
  selectedDistrictFilter = 'All';

  levyRates: LevyRate[] = [];

  // Form Model
  formData: Partial<LevyRate> = this.getEmptyForm();

  // District Quick Filters
  districts = [
    { label: 'सभी ज़िले (All Districts)', value: 'All' },
    { label: 'संत कबीर नगर (खलीलाबाद)', value: 'Sant Kabir Nagar' },
    { label: 'बस्ती (Basti Mandi)', value: 'Basti' },
    { label: 'गोरखपुर (Gorakhpur Mandi)', value: 'Gorakhpur' }
  ];

  categories = ['Grains', 'Oilseeds', 'Pulses', 'Vegetables', 'Fruits', 'Spices'];

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadLevyRates();
  }

  checkAdminStatus(): void {
    const user = this.authService.getUser();
    if (user && (user.role === 'admin' || user.isAdmin)) {
      this.isAdmin = true;
    }
  }

  openDetailsModal(rate: LevyRate): void {
    this.selectedRateForDetails = rate;
    this.calcQuantity = 50;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRateForDetails = null;
  }

  getCalculatedTotal(rate: LevyRate): number {
    const price = rate.modalPrice || rate.rate || 0;
    return price * (this.calcQuantity || 0);
  }

  getCalculatedCess(rate: LevyRate): number {
    const total = this.getCalculatedTotal(rate);
    const cess = rate.levyRate || 1.5;
    return (total * cess) / 100;
  }

  getCalculatedNet(rate: LevyRate): number {
    return this.getCalculatedTotal(rate) - this.getCalculatedCess(rate);
  }

  promptAdminLogin(): void {
    Swal.fire({
      title: 'प्रशासक सत्यापन (Admin Verification)',
      text: 'मंडी दरें जोड़ने या एडिट करने हेतु एडमिन पिन या पासवर्ड दर्ज करें:',
      input: 'password',
      inputPlaceholder: 'Enter Admin PIN / Passcode',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'लॉगिन करें (Verify)',
      cancelButtonText: 'रद्द करें'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'admin' || result.value === 'admin123' || result.value === 'mandi2026') {
          this.isAdmin = true;
          Swal.fire('प्रशासक मोड सक्रिय', 'आप अब नई दरें जोड़ सकते हैं व मौजूदा दरों को एडिट कर सकते हैं।', 'success');
        } else {
          Swal.fire('गलत पिन', 'अमान्य एडमिन क्रेडेंशियल। कृपया सही विवरण भरें।', 'error');
        }
      }
    });
  }

  logoutAdmin(): void {
    this.isAdmin = false;
    Swal.fire('लॉगआउट', 'प्रशासक मोड बंद कर दिया गया। अब केवल विवरण दृश्य (View Only) सक्रिय है।', 'info');
  }

  getEmptyForm(): Partial<LevyRate> {
    return {
      state: 'Uttar Pradesh',
      district: 'Sant Kabir Nagar',
      city: 'Khalilabad',
      municipality: 'Khalilabad Nagar Palika',
      zone: 'Basti Division',
      mandiName: 'Khalilabad APMC Mandi',
      commodity: 'Wheat',
      hindiName: 'गेहूं',
      cropName: 'Wheat (गेहूं)',
      variety: 'Sharbati Grade A',
      category: 'Grains',
      propertyType: 'Agricultural APMC Mandi',
      propertySubType: 'Wholesale Trade',
      rate: 2320,
      modalPrice: 2320,
      minPrice: 2200,
      maxPrice: 2410,
      rateUnit: 'Quintal',
      unit: 'Quintal',
      levyRate: 1.5,
      levyUnit: '%',
      calculationMethod: 'APMC Mandi Cess / Trade Value',
      assessmentYear: '2026-2027',
      status: 'active',
      source: 'Sant Kabir Nagar APMC Mandi Parishad',
      notes: ''
    };
  }

  loadLevyRates(): void {
    this.isLoading = true;
    const filter: any = {};
    if (this.selectedDistrictFilter !== 'All') {
      filter.district = this.selectedDistrictFilter;
    }
    if (this.searchQuery.trim()) {
      filter.search = this.searchQuery.trim();
    }

    this.levyService.getLevyRates(filter).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && Array.isArray(res.data)) {
          this.levyRates = res.data;
        } else {
          this.levyRates = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading levy rates:', err);
      }
    });
  }

  setDistrictFilter(dist: string): void {
    this.selectedDistrictFilter = dist;
    this.loadLevyRates();
  }

  openAddForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = this.getEmptyForm();
    this.showFormModal = true;
  }

  openEditForm(rate: LevyRate): void {
    this.isEditing = true;
    this.editingId = rate._id || null;
    this.formData = { ...rate };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  onDistrictSelectChange(districtName: string): void {
    if (districtName === 'Sant Kabir Nagar') {
      this.formData.city = 'Khalilabad';
      this.formData.municipality = 'Khalilabad Nagar Palika';
      this.formData.zone = 'Basti Division';
      this.formData.mandiName = 'Khalilabad APMC Mandi';
      this.formData.source = 'Sant Kabir Nagar APMC Mandi Parishad';
    } else if (districtName === 'Basti') {
      this.formData.city = 'Basti';
      this.formData.municipality = 'Basti Nagar Palika Parishad';
      this.formData.zone = 'Basti Division';
      this.formData.mandiName = 'Basti Mandi';
      this.formData.source = 'Basti Mandi Samiti Office';
    } else if (districtName === 'Gorakhpur') {
      this.formData.city = 'Gorakhpur';
      this.formData.municipality = 'Gorakhpur Municipal Corporation';
      this.formData.zone = 'Gorakhpur Division';
      this.formData.mandiName = 'Gorakhpur Mandi';
      this.formData.source = 'Gorakhpur Krishi APMC Mandi Parishad';
    }
  }

  saveLevyRate(): void {
    if (!this.formData.commodity || !this.formData.rate) {
      Swal.fire('अधूरा विवरण', 'कृपया फसल का नाम (Commodity) और भाव (Rate) अवश्य भरें।', 'warning');
      return;
    }

    // Auto sync modalPrice and pricePerQuintal with rate
    this.formData.modalPrice = this.formData.rate;
    this.formData.pricePerQuintal = this.formData.rate;
    if (!this.formData.minPrice) {
      this.formData.minPrice = Math.round(Number(this.formData.rate) * 0.95);
    }
    if (!this.formData.maxPrice) {
      this.formData.maxPrice = Math.round(Number(this.formData.rate) * 1.05);
    }

    this.isSaving = true;

    if (this.isEditing && this.editingId) {
      this.levyService.updateLevyRate(this.editingId, this.formData).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            Swal.fire('सफल!', 'लेवी और मंडी दर सफलतापूर्वक अपडेट कर दी गई।', 'success');
            this.closeFormModal();
            this.loadLevyRates();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('त्रुटि', err.error?.message || 'अपडेट विफल रहा', 'error');
        }
      });
    } else {
      this.levyService.createLevyRate(this.formData).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            Swal.fire('🎉 दर जोड़ी गई!', 'नई फसल लेवी दर सफलतापूर्वक दर्ज कर ली गई और लाइव हो गई है।', 'success');
            this.closeFormModal();
            this.loadLevyRates();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('त्रुटि', err.error?.message || 'दर दर्ज नहीं हो सकी', 'error');
        }
      });
    }
  }

  deleteRate(rate: LevyRate): void {
    if (!rate._id) return;

    Swal.fire({
      title: 'दर हटाएं?',
      text: `क्या आप "${rate.commodity} (${rate.district})" की दर को हटाना चाहते हैं?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'हाँ, हटाएं'
    }).then((res) => {
      if (res.isConfirmed) {
        this.levyService.deleteLevyRate(rate._id!).subscribe({
          next: () => {
            Swal.fire('हटा दिया गया!', 'दर सफलतापूर्वक हटा दी गई।', 'success');
            this.loadLevyRates();
          },
          error: (err) => {
            Swal.fire('त्रुटि', err.error?.message || 'हटाने में विफल', 'error');
          }
        });
      }
    });
  }

  toggleStatus(rate: LevyRate): void {
    if (!rate._id) return;
    const newStatus = rate.status === 'active' ? 'inactive' : 'active';
    this.levyService.updateStatus(rate._id, newStatus).subscribe({
      next: () => {
        rate.status = newStatus;
      }
    });
  }

  getCropIcon(commodity: string): string {
    const name = (commodity || '').toLowerCase();
    if (name.includes('wheat') || name.includes('गेहूं')) return 'bi-flower1 text-warning';
    if (name.includes('rice') || name.includes('paddy') || name.includes('धान')) return 'bi-moisture text-success';
    if (name.includes('mustard') || name.includes('सरसों')) return 'bi-droplet-half text-warning';
    if (name.includes('potato') || name.includes('आलू')) return 'bi-egg-fill text-secondary';
    if (name.includes('onion') || name.includes('प्याज')) return 'bi-circle-fill text-danger';
    if (name.includes('pea') || name.includes('मटर')) return 'bi-record-circle-fill text-success';
    if (name.includes('maize') || name.includes('मक्का')) return 'bi-cone-striped text-warning';
    return 'bi-box-seam-fill text-success';
  }
}
