import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MandiRateService } from '../../mandi-rate.service';

@Component({
  selector: 'app-mandi-rates',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './mandi-rates.component.html',
  styleUrl: './mandi-rates.component.scss'
})
export class MandiRatesComponent implements OnInit {
  private mandiRateService = inject(MandiRateService);

  mandiRates: any[] = [];
  allCrops: any[] = [];
  filteredFarmers: any[] = [];
  selectedState: string = 'Uttar Pradesh';
  selectedDistrict: string = '';
  selectedCommodity: string = '';
  loadingRates: boolean = false;
  locationStatus: string = '';
  locationPermissionGranted: boolean = false;
  ratesSource: string = '';
  ratesDate: string = '';
  selectedMandiRateForFarmers: any = null;

  statesList: string[] = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ];

  commoditiesList: string[] = [
    'Wheat', 'Paddy', 'Mustard', 'Potato', 'Onion', 'Tomato', 'Maize', 'Gram', 'Soyabean'
  ];

  ngOnInit(): void {
    this.requestLocationAndFetchRates();
  }

  requestLocationAndFetchRates(): void {
    this.locationStatus = 'Requesting location...';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.locationStatus = 'Resolving location...';
          this.reverseGeocode(lat, lon);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          this.locationStatus = 'Location permission denied. Using default settings.';
          this.fetchMandiRates();
        },
        { timeout: 5000 }
      );
    } else {
      this.locationStatus = 'Geolocation not supported. Using default settings.';
      this.fetchMandiRates();
    }
  }

  reverseGeocode(lat: number, lon: number): void {
    this.mandiRateService.reverseGeocode(lat, lon).subscribe({
      next: (res) => {
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
          
          this.locationStatus = `Location found: ${this.selectedDistrict || 'Unknown District'}, ${this.selectedState}`;
          this.locationPermissionGranted = true;
        } else {
          this.locationStatus = 'Could not resolve location address. Using defaults.';
        }
        this.fetchMandiRates();
      },
      error: (err) => {
        console.error('Reverse geocoding failed:', err);
        this.locationStatus = 'Location resolution failed. Using defaults.';
        this.fetchMandiRates();
      }
    });
  }

  fetchMandiRates(): void {
    this.loadingRates = true;
    this.selectedMandiRateForFarmers = null;
    this.filteredFarmers = [];

    this.mandiRateService.getLiveRates(this.selectedState, this.selectedDistrict, this.selectedCommodity).subscribe({
      next: (res) => {
        this.loadingRates = false;
        if (res.success) {
          this.mandiRates = res.data;
          this.ratesSource = res.source;
          this.ratesDate = res.date;
          this.allCrops = res.dbCrops || [];

          // Auto-select first card to show its farmers
          if (this.mandiRates.length > 0) {
            this.selectMandiRate(this.mandiRates[0]);
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

  selectMandiRate(rate: any): void {
    this.selectedMandiRateForFarmers = rate;
    
    // Find active listings on GaonBazar for this commodity
    const matched = this.allCrops.filter((c: any) => 
      c.cropName.toLowerCase() === rate.commodity.toLowerCase()
    );

    if (matched.length > 0) {
      this.filteredFarmers = matched;
    } else {
      // Mock Kisan Details if no database matches
      this.filteredFarmers = [
        {
          farmerName: 'Rajesh Kumar Ji',
          mobile: '9876543210',
          email: 'rajesh@gaonbazar.com',
          cropName: rate.commodity,
          expectedPrice: rate.modal_price - 30,
          unit: 'Qtl',
          quantity: 120,
          location: `${rate.market || 'Local Mandi'}, ${rate.district}`,
          grade: 'Grade A'
        },
        {
          farmerName: 'Ramesh Singh',
          mobile: '9123456789',
          email: 'ramesh@gaonbazar.com',
          cropName: rate.commodity,
          expectedPrice: rate.modal_price + 20,
          unit: 'Qtl',
          quantity: 85,
          location: `${rate.district}`,
          grade: 'Grade A+'
        }
      ];
    }
  }
}
