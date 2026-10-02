import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LevyRateService, LevyRate } from '../../core/levy-rate.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-levy-rate-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './levy-rate-management.component.html',
  styleUrl: './levy-rate-management.component.scss'
})
export class LevyRateManagementComponent implements OnInit {
  private levyService = inject(LevyRateService);

  levyRates: LevyRate[] = [];
  filteredRates: LevyRate[] = [];
  isLoading = true;
  isSaving = false;

  searchQuery = '';
  selectedDistrict = 'All';

  // Modal State
  showModal = false;
  isEditing = false;
  editingId: string | null = null;

  districts = [
    { label: 'All Mandis (सभी)', value: 'All' },
    { label: 'Sant Kabir Nagar (खलीलाबाद)', value: 'Sant Kabir Nagar' },
    { label: 'Basti (बस्ती मंडी)', value: 'Basti' },
    { label: 'Gorakhpur (गोरखपुर मंडी)', value: 'Gorakhpur' }
  ];

  categories = ['Grains', 'Oilseeds', 'Pulses', 'Vegetables', 'Fruits', 'Spices'];

  formData: Partial<LevyRate> = this.getEmptyForm();

  ngOnInit(): void {
    this.loadRates();
  }

  getEmptyForm(): Partial<LevyRate> {
    return {
      state: 'Uttar Pradesh',
      district: 'Sant Kabir Nagar',
      city: 'Khalilabad',
      municipality: 'Khalilabad Nagar Palika',
      zone: 'Basti Division',
      mandiName: 'Khalilabad APMC Mandi',
      commodity: '',
      hindiName: '',
      variety: 'Grade A',
      category: 'Grains',
      propertyType: 'Agricultural APMC Mandi',
      propertySubType: 'Wholesale Trade',
      rate: 2350,
      modalPrice: 2350,
      minPrice: 2200,
      maxPrice: 2450,
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

  loadRates(): void {
    this.isLoading = true;
    const filter: any = {};
    if (this.selectedDistrict !== 'All') {
      filter.district = this.selectedDistrict;
    }
    if (this.searchQuery.trim()) {
      filter.search = this.searchQuery.trim();
    }

    this.levyService.getLevyRates(filter).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && Array.isArray(res.data)) {
          this.levyRates = res.data;
          this.filteredRates = res.data;
        } else {
          this.levyRates = [];
          this.filteredRates = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching levy rates:', err);
      }
    });
  }

  onDistrictFilter(dist: string): void {
    this.selectedDistrict = dist;
    this.loadRates();
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

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = this.getEmptyForm();
    this.showModal = true;
  }

  openEditModal(rate: LevyRate): void {
    this.isEditing = true;
    this.editingId = rate._id || null;
    this.formData = { ...rate };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  saveRate(): void {
    if (!this.formData.commodity || !this.formData.rate) {
      Swal.fire('अधूरा विवरण', 'कृपया जिंस का नाम (Commodity) और भाव (Rate) अवश्य भरें।', 'warning');
      return;
    }

    // Auto calculate min and max price if not provided
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
            Swal.fire('सफल!', 'मंडी लेवी दर सफलतापूर्वक अपडेट कर दी गई।', 'success');
            this.closeModal();
            this.loadRates();
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
            Swal.fire('दर जोड़ी गई!', 'नई APMC मंडी लेवी दर सफलतापूर्वक सुरक्षित कर ली गई।', 'success');
            this.closeModal();
            this.loadRates();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('त्रुटि', err.error?.message || 'दर जोड़ना विफल रहा', 'error');
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
      confirmButtonText: 'हाँ, हटाएं',
      cancelButtonText: 'रद्द करें'
    }).then((res) => {
      if (res.isConfirmed) {
        this.levyService.deleteLevyRate(rate._id!).subscribe({
          next: () => {
            Swal.fire('हटा दिया गया!', 'दर सफलतापूर्वक हटा दी गई।', 'success');
            this.loadRates();
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
    if (name.includes('rice') || name.includes('paddy') || name.includes('धान')) return 'bi-tree-fill text-success';
    if (name.includes('mustard') || name.includes('सरसों')) return 'bi-droplet-half text-warning';
    if (name.includes('potato') || name.includes('आलू')) return 'bi-circle-fill text-secondary';
    if (name.includes('onion') || name.includes('प्याज')) return 'bi-record-circle text-danger';
    return 'bi-box-seam-fill text-success';
  }
}
