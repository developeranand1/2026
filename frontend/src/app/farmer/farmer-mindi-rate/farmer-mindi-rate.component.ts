import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import { AuthService } from '../../core/auth.service';

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
  searchQuery = '';
  selectedState = 'Bihar';
  selectedDistrict = '';

  statesList = [
    'Bihar', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 
    'Rajasthan', 'Gujarat', 'Maharashtra', 'West Bengal'
  ];

  ratesList: Array<any> = [
    { commodity: 'Wheat (गेहूं)', market: 'Muzaffarpur APMC', minPrice: 2050, maxPrice: 2200, modalPrice: 2120, unit: 'Quintal', change: '+2.4%', icon: '🌾' },
    { commodity: 'Paddy (धान)', market: 'Patna Mandi', minPrice: 1780, maxPrice: 1920, modalPrice: 1850, unit: 'Quintal', change: '+1.8%', icon: '🍚' },
    { commodity: 'Mustard (सरसों)', market: 'Gaya Mandi', minPrice: 4950, maxPrice: 5250, modalPrice: 5120, unit: 'Quintal', change: '+3.1%', icon: '🌱' },
    { commodity: 'Maize (मक्का)', market: 'Begusarai APMC', minPrice: 1680, maxPrice: 1820, modalPrice: 1750, unit: 'Quintal', change: '-0.5%', icon: '🌽' },
    { commodity: 'Potato (आलू)', market: 'Nalanda Mandi', minPrice: 1200, maxPrice: 1450, modalPrice: 1320, unit: 'Quintal', change: '+4.0%', icon: '🥔' },
    { commodity: 'Onion (प्याज़)', market: 'Samastipur APMC', minPrice: 2400, maxPrice: 2800, modalPrice: 2600, unit: 'Quintal', change: '+2.0%', icon: '🧅' }
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

  fetchRates(): void {
    this.isLoading = true;
    this.mandiRateService.getLiveRates(this.selectedState, this.selectedDistrict).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.ratesList = res.data.map((item: any) => ({
            commodity: item.commodity || item.crop || 'Crop',
            market: item.market || item.mandi || `${this.selectedState} APMC`,
            minPrice: item.minPrice || item.min_price || Math.round((item.modalPrice || 2000) * 0.95),
            maxPrice: item.maxPrice || item.max_price || Math.round((item.modalPrice || 2000) * 1.05),
            modalPrice: item.modalPrice || item.modal_price || item.rate || 2000,
            unit: item.unit || 'Quintal',
            change: '+2.0%',
            icon: this.getCropIcon(item.commodity || item.crop || '')
          }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading mandi rates:', err);
      }
    });
  }

  get filteredRates(): Array<any> {
    if (!this.searchQuery.trim()) {
      return this.ratesList;
    }
    const q = this.searchQuery.toLowerCase();
    return this.ratesList.filter(r => 
      r.commodity.toLowerCase().includes(q) || 
      r.market.toLowerCase().includes(q)
    );
  }

  private getCropIcon(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('wheat') || name.includes('gehun')) return '🌾';
    if (name.includes('paddy') || name.includes('dhan') || name.includes('rice')) return '🍚';
    if (name.includes('mustard') || name.includes('sarson')) return '🌱';
    if (name.includes('maize') || name.includes('makka')) return '🌽';
    if (name.includes('potato') || name.includes('aalu')) return '🥔';
    if (name.includes('onion') || name.includes('pyaz')) return '🧅';
    if (name.includes('tomato') || name.includes('tamatar')) return '🍅';
    return '🌾';
  }
}
