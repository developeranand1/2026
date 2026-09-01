import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import { AuthService } from '../../core/auth.service';
import { getAllIndianStates, getDistrictsForState } from '../../core/india-locations.data';

export interface MandiRateItem {
  commodity: string;
  category: string;
  market: string;
  district: string;
  state: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  change: string;
  isUp: boolean;
  icon: string;
}

@Component({
  selector: 'app-farmer-mindi-rate',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './farmer-mindi-rate.component.html',
  styleUrl: './farmer-mindi-rate.component.scss'
})
export class FarmerMindiRateComponent implements OnInit {
  private mandiRateService = inject(MandiRateService);
  private authService = inject(AuthService);

  isLoading = false;
  isLocating = false;
  searchQuery = '';
  selectedState = 'Uttar Pradesh';
  selectedDistrict = '';
  selectedCategory = 'All';
  viewMode: 'grid' | 'list' = 'grid';

  // Detail Modal State
  selectedRateDetail: MandiRateItem | null = null;
  showModal = false;

  statesList: string[] = getAllIndianStates();
  districtsList: string[] = [];

  categoryList = [
    { label: 'All Crops', value: 'All', icon: 'bi-grid-fill' },
    { label: 'Grains & Cereals', value: 'Grains', icon: 'bi-flower1' },
    { label: 'Vegetables', value: 'Vegetables', icon: 'bi-basket2-fill' },
    { label: 'Fresh Fruits', value: 'Fruits', icon: 'bi-apple' },
    { label: 'Oilseeds', value: 'Oilseeds', icon: 'bi-droplet-half' },
    { label: 'Pulses & Legumes', value: 'Pulses', icon: 'bi-egg-fried' }
  ];

  ratesList: MandiRateItem[] = [];

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.state) {
      this.selectedState = user.state;
    }
    if (user && user.district) {
      this.selectedDistrict = user.district;
    }
    this.updateDistricts();
    this.fetchRates();
  }

  updateDistricts(): void {
    this.districtsList = getDistrictsForState(this.selectedState);
  }

  onStateChange(): void {
    this.updateDistricts();
    this.selectedDistrict = '';
    this.fetchRates();
  }

  onDistrictChange(): void {
    this.fetchRates();
  }

  // Detect current location via Browser Geolocation API
  autoDetectLocation(): void {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.mandiRateService.reverseGeocode(lat, lon).subscribe({
          next: (res) => {
            this.isLocating = false;
            if (res && res.address) {
              const state = res.address.state;
              const district = res.address.state_district || res.address.county || res.address.city;

              if (state) {
                const matchedState = this.statesList.find(s => s.toLowerCase() === state.toLowerCase());
                if (matchedState) {
                  this.selectedState = matchedState;
                  this.updateDistricts();
                }
              }
              if (district) {
                const cleanDist = district.replace(/District/i, '').trim();
                const matchedDist = this.districtsList.find(d => d.toLowerCase().includes(cleanDist.toLowerCase()));
                this.selectedDistrict = matchedDist || cleanDist;
              }
              this.fetchRates();
            }
          },
          error: () => {
            this.isLocating = false;
            this.fetchRates();
          }
        });
      },
      (err) => {
        this.isLocating = false;
        console.warn('Geolocation denied:', err.message);
      },
      { timeout: 6000 }
    );
  }

  fetchRates(): void {
    this.isLoading = true;
    this.mandiRateService.getLiveRates(this.selectedState, this.selectedDistrict).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.ratesList = res.data.map((item: any) => {
            const cropName = item.commodity || item.crop || 'Crop';
            const modal = item.modal_price || item.modalPrice || item.rate || 2000;
            const min = item.min_price || item.minPrice || Math.round(modal * 0.94);
            const max = item.max_price || item.maxPrice || Math.round(modal * 1.06);

            return {
              commodity: cropName,
              category: item.category || this.detectCategory(cropName),
              market: item.market || item.mandi || `${this.selectedState} APMC`,
              district: item.district || this.selectedDistrict || 'Local Mandi',
              state: item.state || this.selectedState,
              variety: item.variety || 'Standard Grade',
              arrivalDate: item.arrival_date || item.arrivalDate || 'Today',
              minPrice: min,
              maxPrice: max,
              modalPrice: modal,
              unit: item.unit || 'Quintal',
              change: item.change || '+1.8%',
              isUp: item.isUp !== undefined ? item.isUp : !(item.change && item.change.includes('-')),
              icon: this.getCropIcon(cropName)
            };
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Error fetching mandi rates:', err);
      }
    });
  }

  get filteredRates(): MandiRateItem[] {
    let result = this.ratesList;

    if (this.selectedCategory !== 'All') {
      result = result.filter(r => r.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r => 
        r.commodity.toLowerCase().includes(q) || 
        r.market.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.variety.toLowerCase().includes(q)
      );
    }

    return result;
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  openDetailModal(rate: MandiRateItem): void {
    this.selectedRateDetail = rate;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRateDetail = null;
  }

  private detectCategory(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('potato') || name.includes('onion') || name.includes('tomato') || name.includes('cauliflower') || name.includes('chilli') || name.includes('garlic') || name.includes('ginger')) {
      return 'Vegetables';
    }
    if (name.includes('apple') || name.includes('mango') || name.includes('banana') || name.includes('orange') || name.includes('pomegranate') || name.includes('guava')) {
      return 'Fruits';
    }
    if (name.includes('mustard') || name.includes('soybean') || name.includes('groundnut') || name.includes('sunflower') || name.includes('oil')) {
      return 'Oilseeds';
    }
    if (name.includes('gram') || name.includes('chana') || name.includes('pulse') || name.includes('moong') || name.includes('tur') || name.includes('urad') || name.includes('dal') || name.includes('cotton') || name.includes('sugarcane')) {
      return 'Pulses';
    }
    return 'Grains';
  }

  private getCropIcon(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('apple') || name.includes('mango') || name.includes('banana') || name.includes('orange') || name.includes('pomegranate')) return 'bi-apple';
    if (name.includes('wheat') || name.includes('gehun')) return 'bi-flower1';
    if (name.includes('paddy') || name.includes('dhan') || name.includes('rice')) return 'bi-flower2';
    if (name.includes('mustard') || name.includes('sarson')) return 'bi-droplet-half';
    if (name.includes('maize') || name.includes('makka')) return 'bi-tree-fill';
    if (name.includes('potato') || name.includes('aalu')) return 'bi-box-seam';
    if (name.includes('onion') || name.includes('pyaz')) return 'bi-tag-fill';
    if (name.includes('tomato') || name.includes('tamatar')) return 'bi-basket2-fill';
    if (name.includes('cotton') || name.includes('kapas')) return 'bi-cloud-sun-fill';
    if (name.includes('sugarcane') || name.includes('ganna')) return 'bi-diagram-3-fill';
    if (name.includes('gram') || name.includes('chana') || name.includes('moong')) return 'bi-egg-fried';
    if (name.includes('soybean')) return 'bi-pie-chart-fill';
    return 'bi-flower1';
  }
}
