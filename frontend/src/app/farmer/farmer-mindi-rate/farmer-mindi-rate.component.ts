import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import { AuthService } from '../../core/auth.service';

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
  selectedState = 'Bihar';
  selectedDistrict = '';
  selectedCategory = 'All';
  viewMode: 'grid' | 'list' = 'grid';

  // Detail Modal State
  selectedRateDetail: MandiRateItem | null = null;
  showModal = false;

  statesList = [
    'Bihar', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 
    'Rajasthan', 'Gujarat', 'Maharashtra', 'West Bengal'
  ];

  categoryList = [
    { label: 'All Crops', value: 'All', icon: 'bi-grid-fill' },
    { label: 'Grains & Cereals', value: 'Grains', icon: 'bi-flower1' },
    { label: 'Vegetables', value: 'Vegetables', icon: 'bi-basket2-fill' },
    { label: 'Oilseeds', value: 'Oilseeds', icon: 'bi-droplet-half' },
    { label: 'Pulses & Legumes', value: 'Pulses', icon: 'bi-egg-fried' }
  ];

  ratesList: MandiRateItem[] = [
    { commodity: 'Wheat (गेहूं)', category: 'Grains', market: 'Muzaffarpur APMC', district: 'Muzaffarpur', state: 'Bihar', variety: 'Dara / Hybrid', arrivalDate: 'Today', minPrice: 2150, maxPrice: 2350, modalPrice: 2275, unit: 'Quintal', change: '+2.4%', isUp: true, icon: 'bi-flower1' },
    { commodity: 'Paddy (धान - Sharbati)', category: 'Grains', market: 'Patna Central Mandi', district: 'Patna', state: 'Bihar', variety: 'Sharbati / Grade A', arrivalDate: 'Today', minPrice: 1980, maxPrice: 2250, modalPrice: 2180, unit: 'Quintal', change: '+1.8%', isUp: true, icon: 'bi-flower2' },
    { commodity: 'Mustard (सरसों - Yellow)', category: 'Oilseeds', market: 'Gaya APMC', district: 'Gaya', state: 'Bihar', variety: 'Peeli Sarson', arrivalDate: 'Today', minPrice: 5150, maxPrice: 5650, modalPrice: 5450, unit: 'Quintal', change: '+3.1%', isUp: true, icon: 'bi-droplet-half' },
    { commodity: 'Maize (मक्का)', category: 'Grains', market: 'Begusarai Mandi', district: 'Begusarai', state: 'Bihar', variety: 'Yellow Corn', arrivalDate: 'Today', minPrice: 1780, maxPrice: 1980, modalPrice: 1920, unit: 'Quintal', change: '-0.5%', isUp: false, icon: 'bi-tree-fill' },
    { commodity: 'Potato (आलू - Jyoti)', category: 'Vegetables', market: 'Nalanda Mandi', district: 'Nalanda', state: 'Bihar', variety: 'Jyoti Grade A', arrivalDate: 'Today', minPrice: 1250, maxPrice: 1550, modalPrice: 1420, unit: 'Quintal', change: '+4.0%', isUp: true, icon: 'bi-box-seam' },
    { commodity: 'Onion (प्याज़ - Red)', category: 'Vegetables', market: 'Samastipur APMC', district: 'Samastipur', state: 'Bihar', variety: 'Nasik Red', arrivalDate: 'Today', minPrice: 2450, maxPrice: 2850, modalPrice: 2650, unit: 'Quintal', change: '+2.0%', isUp: true, icon: 'bi-tag-fill' },
    { commodity: 'Tomato (टमाटर)', category: 'Vegetables', market: 'Vaishali Mandi', district: 'Vaishali', state: 'Bihar', variety: 'Desi Hybrid', arrivalDate: 'Today', minPrice: 1850, maxPrice: 2300, modalPrice: 2100, unit: 'Quintal', change: '+3.5%', isUp: true, icon: 'bi-basket2-fill' },
    { commodity: 'Green Gram (मूंग)', category: 'Pulses', market: 'Bhagalpur APMC', district: 'Bhagalpur', state: 'Bihar', variety: 'Hari Moong', arrivalDate: 'Today', minPrice: 6800, maxPrice: 7500, modalPrice: 7200, unit: 'Quintal', change: '+2.8%', isUp: true, icon: 'bi-egg-fried' }
  ];

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.state) {
      this.selectedState = user.state;
    }
    if (user && user.district) {
      this.selectedDistrict = user.district;
    }
    this.fetchRates();
  }

  // Detect current location via Browser Geolocation API
  autoDetectLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
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
                this.selectedState = matchedState || state;
              }
              if (district) {
                this.selectedDistrict = district;
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
      }
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
            return {
              commodity: cropName,
              category: this.detectCategory(cropName),
              market: item.market || item.mandi || `${this.selectedState} APMC`,
              district: item.district || this.selectedDistrict || 'Local Mandi',
              state: item.state || this.selectedState,
              variety: item.variety || 'Standard Grade',
              arrivalDate: item.arrival_date || item.arrivalDate || new Date().toLocaleDateString('en-IN'),
              minPrice: item.min_price || item.minPrice || Math.round((item.modal_price || item.modalPrice || 2000) * 0.94),
              maxPrice: item.max_price || item.maxPrice || Math.round((item.modal_price || item.modalPrice || 2000) * 1.06),
              modalPrice: item.modal_price || item.modalPrice || item.rate || 2000,
              unit: item.unit || 'Quintal',
              change: item.change || '+2.0%',
              isUp: !(item.change && item.change.includes('-')),
              icon: this.getCropIcon(cropName)
            };
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching mandi rates:', err);
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
        r.district.toLowerCase().includes(q)
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
    if (name.includes('potato') || name.includes('aalu') || name.includes('onion') || name.includes('pyaz') || name.includes('tomato') || name.includes('tamatar') || name.includes('veggie')) {
      return 'Vegetables';
    }
    if (name.includes('mustard') || name.includes('sarson') || name.includes('soybean') || name.includes('oil')) {
      return 'Oilseeds';
    }
    if (name.includes('gram') || name.includes('chana') || name.includes('pulse') || name.includes('moong') || name.includes('dal')) {
      return 'Pulses';
    }
    return 'Grains';
  }

  private getCropIcon(cropName: string): string {
    const name = cropName.toLowerCase();
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
