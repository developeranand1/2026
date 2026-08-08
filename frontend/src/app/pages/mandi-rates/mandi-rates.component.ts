import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MandiRateService } from '../home/mandi-rate.service';

export interface DetailedCropMandiRate {
  id: string;
  commodity: string;
  hindiName: string;
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
  image: string;
  season: string;
  description: string;
  marketTips: string;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-mandi-rates-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './mandi-rates.component.html',
  styleUrl: './mandi-rates.component.scss'
})
export class MandiRatesPageComponent implements OnInit {
  private mandiRateService = inject(MandiRateService);

  isLoading = false;
  isLocating = false;
  searchQuery = '';
  selectedState = 'Bihar';
  selectedDistrict = '';
  selectedCategory = 'All';
  locationStatus = 'Detecting nearest Mandi market...';
  ratesSource = 'live_agmarknet';
  ratesDate = new Date().toLocaleDateString('en-IN');

  // Modal State
  activeCropDetail: DetailedCropMandiRate | null = null;
  showDetailModal = false;

  statesList = [
    'Bihar', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 
    'Rajasthan', 'Gujarat', 'Maharashtra', 'West Bengal'
  ];

  categoryList = [
    { label: 'All Crops', value: 'All', icon: 'bi-grid-fill' },
    { label: 'Grains & Cereals', value: 'Grains', icon: 'bi-flower1' },
    { label: 'Vegetables', value: 'Vegetables', icon: 'bi-basket2-fill' },
    { label: 'Fresh Fruits', value: 'Fruits', icon: 'bi-apple' },
    { label: 'Oilseeds', value: 'Oilseeds', icon: 'bi-droplet-half' },
    { label: 'Pulses & Cash Crops', value: 'Pulses', icon: 'bi-egg-fried' }
  ];

  cropsList: DetailedCropMandiRate[] = [
    {
      id: 'wheat-01',
      commodity: 'Wheat',
      hindiName: 'गेहूं (Sharbati & Dara)',
      category: 'Grains',
      market: 'Muzaffarpur Central APMC',
      district: 'Muzaffarpur',
      state: 'Bihar',
      variety: 'Sharbati / Dara Grade A',
      arrivalDate: 'Today',
      minPrice: 2150,
      maxPrice: 2380,
      modalPrice: 2275,
      unit: 'Quintal',
      change: '+2.4%',
      isUp: true,
      icon: 'bi-flower1',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      season: 'Rabi Season (Harvest: Mar - Apr)',
      description: 'High-protein staple wheat grain preferred for premium rotis, bakery flour, and commercial milling. High moisture retention and golden grain texture.',
      marketTips: 'Demand is high across North Indian flour mills. Expect stable price appreciation over the next 2 weeks.'
    },
    {
      id: 'paddy-02',
      commodity: 'Paddy / Rice',
      hindiName: 'धान (Sharbati & Basmati)',
      category: 'Grains',
      market: 'Patna Krishi Mandi',
      district: 'Patna',
      state: 'Bihar',
      variety: 'Sharbati Grade A',
      arrivalDate: 'Today',
      minPrice: 1980,
      maxPrice: 2250,
      modalPrice: 2180,
      unit: 'Quintal',
      change: '+1.8%',
      isUp: true,
      icon: 'bi-flower2',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      season: 'Kharif Season (Harvest: Oct - Dec)',
      description: 'Unhusked paddy rice cultivated in river plains. Clean long-grain variety with excellent milling yield and aromatic cooking fragrance.',
      marketTips: 'Export demand for long-grain paddy remains strong. Mandi arrival volume is steady.'
    },
    {
      id: 'apple-03',
      commodity: 'Apple',
      hindiName: 'सेब (Shimla & Royal Delicious)',
      category: 'Fruits',
      market: 'Patna Fruit APMC',
      district: 'Patna',
      state: 'Bihar',
      variety: 'Royal Delicious Grade 1',
      arrivalDate: 'Today',
      minPrice: 7800,
      maxPrice: 9200,
      modalPrice: 8500,
      unit: 'Quintal',
      change: '+3.8%',
      isUp: true,
      icon: 'bi-apple',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
      season: 'Autumn Harvest (Aug - Oct)',
      description: 'Fresh crisp apples transported directly from cold store orchards. Bright red skin, firm texture, and high sweetness index.',
      marketTips: 'Festive season wholesale buyers are driving strong fruit auction rates.'
    },
    {
      id: 'mango-04',
      commodity: 'Mango',
      hindiName: 'आम (Alphonso & Langra)',
      category: 'Fruits',
      market: 'Bhagalpur Fruit APMC',
      district: 'Bhagalpur',
      state: 'Bihar',
      variety: 'Langra / Alphonso Grade A',
      arrivalDate: 'Today',
      minPrice: 5500,
      maxPrice: 6800,
      modalPrice: 6200,
      unit: 'Quintal',
      change: '+4.2%',
      isUp: true,
      icon: 'bi-basket3-fill',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
      season: 'Summer Harvest (May - Jul)',
      description: 'Aromatic king of fruits. Naturally ripened mangoes with rich pulp content, packed carefully in wooden crates.',
      marketTips: 'High retail consumer demand. Crate auctions are settling above standard modal averages.'
    },
    {
      id: 'mustard-05',
      commodity: 'Mustard Seeds',
      hindiName: 'सरसों (Yellow & Black)',
      category: 'Oilseeds',
      market: 'Gaya APMC Yard',
      district: 'Gaya',
      state: 'Bihar',
      variety: 'Peeli Sarson Grade 1',
      arrivalDate: 'Today',
      minPrice: 5150,
      maxPrice: 5650,
      modalPrice: 5450,
      unit: 'Quintal',
      change: '+3.1%',
      isUp: true,
      icon: 'bi-droplet-half',
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
      season: 'Rabi Season (Harvest: Feb - Mar)',
      description: 'High-oil content mustard seeds essential for mustard oil extraction and industrial processing. Low moisture content guaranteed.',
      marketTips: 'Domestic edible oil mills are aggressively buying yellow mustard batches.'
    },
    {
      id: 'banana-06',
      commodity: 'Banana',
      hindiName: 'केला (Robusta & Harichhal)',
      category: 'Fruits',
      market: 'Vaishali Fruit APMC',
      district: 'Vaishali',
      state: 'Bihar',
      variety: 'Robusta Green Grade 1',
      arrivalDate: 'Today',
      minPrice: 2100,
      maxPrice: 2600,
      modalPrice: 2400,
      unit: 'Quintal',
      change: '+1.5%',
      isUp: true,
      icon: 'bi-basket3-fill',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
      season: 'Year-Round Harvest',
      description: 'Fresh farm-harvested green banana bunches. Uniform hand sizes, perfect for ripening chambers and fruit distribution.',
      marketTips: 'Daily retail consumption is steady across district markets.'
    },
    {
      id: 'potato-07',
      commodity: 'Potato',
      hindiName: 'आलू (Jyoti & Chandramukhi)',
      category: 'Vegetables',
      market: 'Nalanda Sabzi Mandi',
      district: 'Nalanda',
      state: 'Bihar',
      variety: 'Jyoti Grade A',
      arrivalDate: 'Today',
      minPrice: 1250,
      maxPrice: 1550,
      modalPrice: 1420,
      unit: 'Quintal',
      change: '+4.0%',
      isUp: true,
      icon: 'bi-box-seam',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      season: 'Winter Harvest (Jan - Mar)',
      description: 'Cold-storage preserved fresh potatoes. Clean skin texture, ideal size for wholesale distribution, hotels, and retail markets.',
      marketTips: 'Cold storage stock release is fetching strong prices in regional metro markets.'
    },
    {
      id: 'onion-08',
      commodity: 'Red Onion',
      hindiName: 'प्याज़ (Nasik & Local Red)',
      category: 'Vegetables',
      market: 'Samastipur Wholesale APMC',
      district: 'Samastipur',
      state: 'Bihar',
      variety: 'Nasik Red Medium',
      arrivalDate: 'Today',
      minPrice: 2450,
      maxPrice: 2850,
      modalPrice: 2650,
      unit: 'Quintal',
      change: '+2.0%',
      isUp: true,
      icon: 'bi-tag-fill',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      season: 'Rabi & Kharif (Harvest: Apr & Dec)',
      description: 'Well-cured red onion bulbs with tight dry outer skins. Excellent storage life and high demand across cooking and catering trades.',
      marketTips: 'Interstate transport demand is driving up onion wholesale modal rates.'
    },
    {
      id: 'tomato-09',
      commodity: 'Tomato',
      hindiName: 'टमाटर (Hybrid Red)',
      category: 'Vegetables',
      market: 'Vaishali Sabzi APMC',
      district: 'Vaishali',
      state: 'Bihar',
      variety: 'Desi Hybrid Grade 1',
      arrivalDate: 'Today',
      minPrice: 1850,
      maxPrice: 2300,
      modalPrice: 2100,
      unit: 'Quintal',
      change: '+3.5%',
      isUp: true,
      icon: 'bi-basket2-fill',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      season: 'Year-Round Vegetable Harvest',
      description: 'Firm red tomatoes harvested at peak ripeness. Packed in plastic crates to prevent transit damage.',
      marketTips: 'Retail kitchen consumption is high. Good quality crates are clearing fast at morning auctions.'
    },
    {
      id: 'moong-10',
      commodity: 'Green Gram (Moong)',
      hindiName: 'मूंग दाल (Hari Moong)',
      category: 'Pulses',
      market: 'Bhagalpur Grain APMC',
      district: 'Bhagalpur',
      state: 'Bihar',
      variety: 'Hari Moong Grade A',
      arrivalDate: 'Today',
      minPrice: 6800,
      maxPrice: 7500,
      modalPrice: 7200,
      unit: 'Quintal',
      change: '+2.8%',
      isUp: true,
      icon: 'bi-egg-fried',
      image: 'https://images.unsplash.com/photo-1585992629465-802582827a67?auto=format&fit=crop&w=800&q=80',
      season: 'Zaid & Summer Harvest (May - Jun)',
      description: 'High-protein green gram pulse. Machine-cleaned grains without dust or pest damage, ready for milling into moong dal.',
      marketTips: 'Pulse millers are actively stocking up due to restricted import policies.'
    }
  ];

  // FAQ Knowledge Items for Mandi Rates
  readonly mandiFaqs = [
    {
      question: 'What is the Modal Price (मंडी दर) in APMC Mandis?',
      answer: 'The Modal Price represents the most frequent transaction price at which the majority of a specific crop quantity was sold during the day’s official Mandi auction.'
    },
    {
      question: 'How often are Government APMC Mandi rates updated?',
      answer: 'Mandi rates are updated daily after the conclusion of morning auctions (typically between 11:00 AM and 2:00 PM) based on official AGMARKNET and state agriculture board feeds.'
    },
    {
      question: 'Why do Mandi prices fluctuate between different districts?',
      answer: 'Price differences occur due to local supply & demand, crop quality grades, transport costs, distance from major consumer markets, and moisture content in fresh harvests.'
    },
    {
      question: 'Can buyers & farmers trade directly using these rates?',
      answer: 'Yes! GaonBazar uses live APMC mandi rates as transparent benchmark indicators so farmers and commercial buyers can negotiate fair direct deals without middleman cuts.'
    }
  ];

  ngOnInit(): void {
    this.requestLocationAndFetchRates();
  }

  autoDetectLocation(): void {
    this.requestLocationAndFetchRates();
  }

  requestLocationAndFetchRates(): void {
    if (navigator.geolocation) {
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
                  const matched = this.statesList.find(s => s.toLowerCase() === state.toLowerCase());
                  this.selectedState = matched || state;
                }
                if (district) {
                  this.selectedDistrict = district;
                }
                this.locationStatus = `Location: ${this.selectedDistrict || 'Local Area'}, ${this.selectedState}`;
              }
              this.fetchMandiRates();
            },
            error: () => {
              this.isLocating = false;
              this.fetchMandiRates();
            }
          });
        },
        (err) => {
          this.isLocating = false;
          this.locationStatus = `Location: ${this.selectedState} Mandis`;
          this.fetchMandiRates();
        }
      );
    } else {
      this.fetchMandiRates();
    }
  }

  fetchMandiRates(): void {
    this.isLoading = true;
    this.mandiRateService.getLiveRates(this.selectedState, this.selectedDistrict).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.ratesSource = res.source;
          this.ratesDate = res.date || new Date().toLocaleDateString('en-IN');
          
          this.cropsList = res.data.map((item: any, idx: number) => {
            const cropName = item.commodity || item.crop || 'Crop';
            return {
              id: `crop-${idx}`,
              commodity: cropName,
              hindiName: this.getHindiCropName(cropName),
              category: item.category || this.detectCategory(cropName),
              market: item.market || `${this.selectedState} APMC`,
              district: item.district || this.selectedDistrict || 'Local Mandi',
              state: item.state || this.selectedState,
              variety: item.variety || 'Standard Grade A',
              arrivalDate: item.arrival_date || item.arrivalDate || new Date().toLocaleDateString('en-IN'),
              minPrice: item.min_price || item.minPrice || Math.round((item.modal_price || item.modalPrice || 2000) * 0.94),
              maxPrice: item.max_price || item.maxPrice || Math.round((item.modal_price || item.modalPrice || 2000) * 1.06),
              modalPrice: item.modal_price || item.modalPrice || item.rate || 2000,
              unit: item.unit || 'Quintal',
              change: item.change || '+2.0%',
              isUp: !(item.change && item.change.includes('-')),
              icon: this.getCropIcon(cropName),
              image: this.getCropImage(cropName),
              season: 'Current Harvest Season',
              description: `Fresh quality ${cropName} harvested in ${item.district || this.selectedState}. Meets standard APMC grade specifications for commercial trading.`,
              marketTips: `Active auction trading recorded at ${item.market || 'APMC Mandi'}. Benchmark prices remain favorable for farmers and buyers.`,
              isExpanded: false
            };
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching live mandi rates:', err);
      }
    });
  }

  get filteredCrops(): DetailedCropMandiRate[] {
    let result = this.cropsList;

    if (this.selectedCategory !== 'All') {
      result = result.filter(c => c.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c => 
        c.commodity.toLowerCase().includes(q) || 
        c.hindiName.toLowerCase().includes(q) ||
        c.market.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q)
      );
    }

    return result;
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  toggleExpand(crop: DetailedCropMandiRate): void {
    crop.isExpanded = !crop.isExpanded;
  }

  openCropModal(crop: DetailedCropMandiRate): void {
    this.activeCropDetail = crop;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.activeCropDetail = null;
  }

  private getHindiCropName(cropName: string): string {
    const n = cropName.toLowerCase();
    if (n.includes('apple') || n.includes('seb')) return 'सेब (Shimla & Royal Delicious)';
    if (n.includes('mango') || n.includes('aam')) return 'आम (Alphonso & Langra)';
    if (n.includes('banana') || n.includes('kela')) return 'केला (Robusta & Harichhal)';
    if (n.includes('orange') || n.includes('santara')) return 'संतरा (Nagpur Juicy)';
    if (n.includes('pomegranate') || n.includes('anar')) return 'अनार (Bhagwa Grade A)';
    if (n.includes('wheat')) return 'गेहूं (Sharbati & Dara)';
    if (n.includes('paddy') || n.includes('rice')) return 'धान (Sharbati & Basmati)';
    if (n.includes('mustard')) return 'सरसों (Yellow & Black)';
    if (n.includes('maize') || n.includes('corn')) return 'मक्का (Yellow Corn)';
    if (n.includes('potato')) return 'आलू (Jyoti Grade)';
    if (n.includes('onion')) return 'प्याज़ (Nasik Red)';
    if (n.includes('tomato')) return 'टमाटर (Desi Hybrid)';
    if (n.includes('gram') || n.includes('moong')) return 'मूंग / चना दाल';
    return cropName;
  }

  private detectCategory(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('apple') || name.includes('mango') || name.includes('banana') || name.includes('orange') || name.includes('pomegranate') || name.includes('guava') || name.includes('fruit') || name.includes('seb') || name.includes('aam') || name.includes('kela') || name.includes('santara') || name.includes('anar')) {
      return 'Fruits';
    }
    if (name.includes('potato') || name.includes('aalu') || name.includes('onion') || name.includes('pyaz') || name.includes('tomato') || name.includes('tamatar') || name.includes('cauliflower') || name.includes('gobhi') || name.includes('brinjal') || name.includes('baingan') || name.includes('chili') || name.includes('mirch')) {
      return 'Vegetables';
    }
    if (name.includes('mustard') || name.includes('sarson') || name.includes('soybean') || name.includes('soyabean') || name.includes('groundnut') || name.includes('mungfali') || name.includes('sunflower') || name.includes('oil')) {
      return 'Oilseeds';
    }
    if (name.includes('gram') || name.includes('chana') || name.includes('pulse') || name.includes('moong') || name.includes('arhar') || name.includes('tur') || name.includes('masoor') || name.includes('urad') || name.includes('dal') || name.includes('sugarcane') || name.includes('cotton') || name.includes('jute')) {
      return 'Pulses';
    }
    return 'Grains';
  }

  private getCropIcon(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('apple') || name.includes('seb')) return 'bi-apple';
    if (name.includes('mango') || name.includes('aam') || name.includes('banana') || name.includes('kela') || name.includes('orange') || name.includes('pomegranate') || name.includes('fruit')) return 'bi-basket3-fill';
    if (name.includes('wheat')) return 'bi-flower1';
    if (name.includes('paddy') || name.includes('rice')) return 'bi-flower2';
    if (name.includes('mustard')) return 'bi-droplet-half';
    if (name.includes('maize')) return 'bi-tree-fill';
    if (name.includes('potato')) return 'bi-box-seam';
    if (name.includes('onion')) return 'bi-tag-fill';
    if (name.includes('tomato')) return 'bi-basket2-fill';
    return 'bi-flower1';
  }

  private getCropImage(cropName: string): string {
    const n = cropName.toLowerCase();
    if (n.includes('apple') || n.includes('seb')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80';
    if (n.includes('mango') || n.includes('aam')) return 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80';
    if (n.includes('banana') || n.includes('kela')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80';
    if (n.includes('orange') || n.includes('santara')) return 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80';
    if (n.includes('pomegranate') || n.includes('anar')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80';
    if (n.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
    if (n.includes('paddy') || n.includes('rice') || n.includes('dhan')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
    if (n.includes('mustard') || n.includes('sarson')) return 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80';
    if (n.includes('maize') || n.includes('corn')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80';
    if (n.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80';
    if (n.includes('onion')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80';
    if (n.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
  }
}
