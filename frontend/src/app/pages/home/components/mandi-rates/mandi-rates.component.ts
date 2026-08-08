import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MandiRateService } from '../../mandi-rate.service';

export interface HomepageMandiRate {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  icon?: string;
  badgeClass?: string;
  change?: string;
  isUp?: boolean;
}

@Component({
  selector: 'app-mandi-rates',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './mandi-rates.component.html',
  styleUrl: './mandi-rates.component.scss'
})
export class MandiRatesComponent implements OnInit, OnDestroy {
  private mandiRateService = inject(MandiRateService);
  private platformId = inject(PLATFORM_ID);

  mandiRates: HomepageMandiRate[] = [];
  selectedState: string = 'Bihar';
  selectedDistrict: string = '';
  selectedCommodity: string = '';
  loadingRates: boolean = false;
  isLocating: boolean = false;
  locationStatus: string = '';
  ratesSource: string = '';
  ratesDate: string = new Date().toLocaleDateString('en-IN');

  // Auto Slider State
  activeSlideIndex: number = 0;
  private autoSlideTimer: any = null;
  isPaused: boolean = false;

  ngOnInit(): void {
    this.requestLocationAndFetchRates();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  get duplicatedRates(): HomepageMandiRate[] {
    if (this.mandiRates.length === 0) return [];
    return [...this.mandiRates, ...this.mandiRates, ...this.mandiRates];
  }

  requestLocationAndFetchRates(): void {
    this.locationStatus = 'Requesting location...';
    if (isPlatformBrowser(this.platformId) && navigator.geolocation) {
      this.isLocating = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.reverseGeocode(lat, lon);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          this.isLocating = false;
          this.locationStatus = 'Location permission denied. Using default settings.';
          this.fetchMandiRates();
        },
        { timeout: 5000 }
      );
    } else {
      this.fetchMandiRates();
    }
  }

  reverseGeocode(lat: number, lon: number): void {
    this.mandiRateService.reverseGeocode(lat, lon).subscribe({
      next: (res) => {
        this.isLocating = false;
        if (res && res.address) {
          const address = res.address;
          const state = address.state || '';
          const district = address.state_district || address.district || address.county || address.city || '';
          
          if (state) {
            this.selectedState = state;
          }
          if (district) {
            this.selectedDistrict = district.replace(/District/i, '').trim();
          }
          
          this.locationStatus = `Location: ${this.selectedDistrict || 'Local Area'}, ${this.selectedState}`;
        } else {
          this.locationStatus = 'Could not resolve location. Using defaults.';
        }
        this.fetchMandiRates();
      },
      error: (err) => {
        this.isLocating = false;
        console.error('Reverse geocoding failed:', err);
        this.fetchMandiRates();
      }
    });
  }

  fetchMandiRates(): void {
    this.loadingRates = true;
    this.stopAutoSlide();

    this.mandiRateService.getLiveRates(this.selectedState, this.selectedDistrict, this.selectedCommodity).subscribe({
      next: (res) => {
        this.loadingRates = false;
        if (res && res.success) {
          this.mandiRates = (res.data || []).map((item: any, idx: number) => {
            const cropName = item.commodity || item.crop || 'Crop';
            return {
              ...item,
              icon: this.getCropIcon(cropName),
              badgeClass: this.getCropBadgeClass(cropName),
              change: (idx % 2 === 0 ? '+' : '-') + (1.2 + (idx % 3) * 0.7).toFixed(1) + '%',
              isUp: idx % 2 === 0
            };
          });
          this.ratesSource = res.source;
          this.ratesDate = res.date || new Date().toLocaleDateString('en-IN');

          if (this.mandiRates.length > 0) {
            this.activeSlideIndex = 0;
            this.startAutoSlide();
          }
        } else {
          this.mandiRates = [];
          this.ratesSource = 'error';
        }
      },
      error: (err) => {
        this.loadingRates = false;
        console.error('Failed to fetch mandi rates:', err);
        this.mandiRates = [];
        this.ratesSource = 'error';
      }
    });
  }

  // CAROUSEL SLIDER CONTROLS
  startAutoSlide(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      if (!this.isPaused && this.mandiRates.length > 0) {
        this.nextSlide();
      }
    }, 2800); // Continuous auto slide every 2.8 seconds
  }

  stopAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  nextSlide(): void {
    if (this.mandiRates.length === 0) return;
    const maxIndex = this.mandiRates.length - 1;
    this.activeSlideIndex = this.activeSlideIndex >= maxIndex ? 0 : this.activeSlideIndex + 1;
  }

  prevSlide(): void {
    if (this.mandiRates.length === 0) return;
    const maxIndex = this.mandiRates.length - 1;
    this.activeSlideIndex = this.activeSlideIndex <= 0 ? maxIndex : this.activeSlideIndex - 1;
  }

  goToSlide(idx: number): void {
    this.activeSlideIndex = idx;
  }

  pauseSlide(): void {
    this.isPaused = true;
  }

  resumeSlide(): void {
    this.isPaused = false;
  }

  getCropIcon(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('wheat') || name.includes('gehun')) return 'bi-flower1';
    if (name.includes('paddy') || name.includes('rice') || name.includes('dhan')) return 'bi-flower2';
    if (name.includes('mustard') || name.includes('sarson')) return 'bi-droplet-half';
    if (name.includes('maize') || name.includes('makka')) return 'bi-tree-fill';
    if (name.includes('potato') || name.includes('aalu')) return 'bi-box-seam';
    if (name.includes('onion') || name.includes('pyaz')) return 'bi-tag-fill';
    if (name.includes('tomato') || name.includes('tamatar')) return 'bi-basket2-fill';
    return 'bi-flower1';
  }

  getCropBadgeClass(cropName: string): string {
    const n = cropName.toLowerCase();
    if (n.includes('wheat') || n.includes('gehun')) return 'avatar-wheat';
    if (n.includes('paddy') || n.includes('dhan') || n.includes('rice')) return 'avatar-paddy';
    if (n.includes('mustard') || n.includes('sarson')) return 'avatar-mustard';
    if (n.includes('maize') || n.includes('makka')) return 'avatar-maize';
    if (n.includes('potato') || n.includes('aalu')) return 'avatar-potato';
    if (n.includes('onion') || n.includes('pyaz')) return 'avatar-onion';
    if (n.includes('tomato') || n.includes('tamatar')) return 'avatar-tomato';
    return 'avatar-default';
  }
}
