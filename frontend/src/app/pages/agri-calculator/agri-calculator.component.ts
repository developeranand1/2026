import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

interface LoanTypeConfig {
  id: string;
  nameHi: string;
  nameEn: string;
  defaultRate: number;
  defaultTenure: number;
  defaultAmount: number;
  minAmount: number;
  maxAmount: number;
  icon: string;
  description: string;
}

interface KusumHpOption {
  hp: number;
  title: string;
  benchmarkCost: number;
  centralSubsidyPct: number;
  stateSubsidyPct: number;
  dieselSavedLitre: number;
}

interface CropPreset {
  id: string;
  nameHi: string;
  nameEn: string;
  avgYieldPerAcre: number;
  mandiPricePerQuintal: number;
  seedCostPerAcre: number;
  fertCostPerAcre: number;
  irrigationCostPerAcre: number;
  laborPrepCostPerAcre: number;
  miscCostPerAcre: number;
  icon: string;
}

@Component({
  selector: 'app-agri-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agri-calculator.component.html',
  styleUrl: './agri-calculator.component.scss'
})
export class AgriCalculatorComponent implements OnInit {
  private seoService = inject(SeoService);

  // Active Tab
  activeTab: 'kcc-loan' | 'pm-kusum' | 'crop-profit' = 'kcc-loan';

  // ==========================================
  // 1. KCC & AGRI LOAN CALCULATOR STATE
  // ==========================================
  loanTypes: LoanTypeConfig[] = [
    {
      id: 'kcc',
      nameHi: 'KCC फसल ऋण (Kisan Credit Card)',
      nameEn: 'Kisan Credit Card (Crop Loan)',
      defaultRate: 7.0,
      defaultTenure: 1,
      defaultAmount: 200000,
      minAmount: 10000,
      maxAmount: 1000000,
      icon: 'bi-credit-card-2-front-fill',
      description: '₹3 लाख तक पर 3% शीघ्र चुकौती छूट के साथ केवल 4% प्रभावी ब्याज दर।'
    },
    {
      id: 'tractor',
      nameHi: 'ट्रैक्टर व कृषि यंत्र ऋण',
      nameEn: 'Tractor & Machinery Loan',
      defaultRate: 9.5,
      defaultTenure: 5,
      defaultAmount: 600000,
      minAmount: 50000,
      maxAmount: 2500000,
      icon: 'bi-truck',
      description: 'ट्रैक्टर, रोटावेटर व कंबाइन हार्वेस्टर खरीद हेतु आसान मासिक किस्त।'
    },
    {
      id: 'solar',
      nameHi: 'सोलर पंप व ग्रीन एनर्जी ऋण',
      nameEn: 'Solar Pump & Green Energy',
      defaultRate: 8.5,
      defaultTenure: 5,
      defaultAmount: 250000,
      minAmount: 30000,
      maxAmount: 1000000,
      icon: 'bi-sun-fill',
      description: 'PM-KUSUM अंतर्गत 60% तक सरकारी सब्सिडी के बाद शेष राशि पर ऋण।'
    },
    {
      id: 'dairy',
      nameHi: 'डेयरी व पशुपालन ऋण (Pashupalan)',
      nameEn: 'Dairy & Animal Husbandry',
      defaultRate: 8.0,
      defaultTenure: 3,
      defaultAmount: 150000,
      minAmount: 20000,
      maxAmount: 1200000,
      icon: 'bi-house-heart-fill',
      description: 'गाय-भैंस खरीद, शेड निर्माण व चारा प्रबंधन हेतु रियायती ऋण।'
    }
  ];

  selectedLoanType = 'kcc';
  loanAmount = 200000;
  interestRate = 7.0;
  tenureYears = 1;

  monthlyEmi = 0;
  totalInterest = 0;
  totalPayment = 0;
  principalPercent = 0;
  interestPercent = 0;
  kccSubventionSavings = 0;

  amountPresets: number[] = [50000, 160000, 300000, 500000, 1000000, 1500000];

  // ==========================================
  // 2. PM-KUSUM SOLAR PUMP CALCULATOR STATE
  // ==========================================
  kusumHpOptions: KusumHpOption[] = [
    { hp: 2, title: '2 HP (छोटा खेत / बागवानी)', benchmarkCost: 160000, centralSubsidyPct: 30, stateSubsidyPct: 30, dieselSavedLitre: 650 },
    { hp: 3, title: '3 HP (मध्यम किसान 2-4 एकड़)', benchmarkCost: 215000, centralSubsidyPct: 30, stateSubsidyPct: 30, dieselSavedLitre: 850 },
    { hp: 5, title: '5 HP (लोकप्रिय 5-8 एकड़)', benchmarkCost: 320000, centralSubsidyPct: 30, stateSubsidyPct: 30, dieselSavedLitre: 1250 },
    { hp: 7.5, title: '7.5 HP (गहरे बोरवेल 8-12 एकड़)', benchmarkCost: 440000, centralSubsidyPct: 30, stateSubsidyPct: 30, dieselSavedLitre: 1750 },
    { hp: 10, title: '10 HP (सामूहिक व बड़ा खेत)', benchmarkCost: 560000, centralSubsidyPct: 30, stateSubsidyPct: 30, dieselSavedLitre: 2200 }
  ];

  selectedHp = 3;
  pumpType: 'submersible' | 'surface' = 'submersible';
  dieselPricePerLitre = 90;

  kusumTotalBenchmarkCost = 0;
  kusumCentralSubsidy = 0;
  kusumStateSubsidy = 0;
  kusumTotalSubsidy = 0;
  kusumFarmerShareTotal = 0;
  kusumBankLoanShare = 0; // 30% bank loan option
  kusumFarmerCashShare = 0; // 10% minimum cash margin
  kusumAnnualDieselSavings = 0;
  kusumPaybackYears = 0;

  // ==========================================
  // 3. CROP PROFIT & ROI (FASAL LABH) CALCULATOR
  // ==========================================
  cropPresets: CropPreset[] = [
    {
      id: 'wheat',
      nameHi: 'गेहूं (Wheat)',
      nameEn: 'Wheat Crop',
      avgYieldPerAcre: 19,
      mandiPricePerQuintal: 2425,
      seedCostPerAcre: 2200,
      fertCostPerAcre: 3600,
      irrigationCostPerAcre: 2200,
      laborPrepCostPerAcre: 5500,
      miscCostPerAcre: 1000,
      icon: 'bi-tree-fill'
    },
    {
      id: 'paddy',
      nameHi: 'धान (Paddy / Rice)',
      nameEn: 'Paddy Crop',
      avgYieldPerAcre: 24,
      mandiPricePerQuintal: 2320,
      seedCostPerAcre: 1800,
      fertCostPerAcre: 4200,
      irrigationCostPerAcre: 3200,
      laborPrepCostPerAcre: 7200,
      miscCostPerAcre: 1200,
      icon: 'bi-droplet-half'
    },
    {
      id: 'mustard',
      nameHi: 'सरसों (Mustard)',
      nameEn: 'Mustard Crop',
      avgYieldPerAcre: 8.5,
      mandiPricePerQuintal: 5950,
      seedCostPerAcre: 1200,
      fertCostPerAcre: 2800,
      irrigationCostPerAcre: 1500,
      laborPrepCostPerAcre: 4000,
      miscCostPerAcre: 800,
      icon: 'bi-flower2'
    },
    {
      id: 'sugarcane',
      nameHi: 'गन्ना (Sugarcane)',
      nameEn: 'Sugarcane Crop',
      avgYieldPerAcre: 360,
      mandiPricePerQuintal: 375,
      seedCostPerAcre: 8500,
      fertCostPerAcre: 9500,
      irrigationCostPerAcre: 6000,
      laborPrepCostPerAcre: 15000,
      miscCostPerAcre: 2500,
      icon: 'bi-slash-square'
    },
    {
      id: 'potato',
      nameHi: 'आलू (Potato)',
      nameEn: 'Potato Crop',
      avgYieldPerAcre: 125,
      mandiPricePerQuintal: 1100,
      seedCostPerAcre: 22000,
      fertCostPerAcre: 12000,
      irrigationCostPerAcre: 4500,
      laborPrepCostPerAcre: 16000,
      miscCostPerAcre: 3500,
      icon: 'bi-egg-fill'
    },
    {
      id: 'cotton',
      nameHi: 'कपास (Cotton)',
      nameEn: 'Cotton Crop',
      avgYieldPerAcre: 10,
      mandiPricePerQuintal: 7521,
      seedCostPerAcre: 3500,
      fertCostPerAcre: 6200,
      irrigationCostPerAcre: 3500,
      laborPrepCostPerAcre: 8500,
      miscCostPerAcre: 1500,
      icon: 'bi-cloud-sun-fill'
    },
    {
      id: 'maize',
      nameHi: 'मक्का (Maize / Corn)',
      nameEn: 'Maize Crop',
      avgYieldPerAcre: 22,
      mandiPricePerQuintal: 2225,
      seedCostPerAcre: 2500,
      fertCostPerAcre: 4000,
      irrigationCostPerAcre: 2500,
      laborPrepCostPerAcre: 5200,
      miscCostPerAcre: 1000,
      icon: 'bi-sun-fill'
    },
    {
      id: 'tomato',
      nameHi: 'टमाटर व सब्जियां (Vegetables)',
      nameEn: 'Tomato & Vegetables',
      avgYieldPerAcre: 150,
      mandiPricePerQuintal: 1400,
      seedCostPerAcre: 8500,
      fertCostPerAcre: 14000,
      irrigationCostPerAcre: 6000,
      laborPrepCostPerAcre: 19000,
      miscCostPerAcre: 4000,
      icon: 'bi-bag-heart-fill'
    }
  ];

  selectedCropId = 'wheat';
  landArea = 2; // default 2 acres
  landUnit: 'acre' | 'bigha' = 'acre'; // 1 Acre = 1.6 Bigha standard UP/Bihar/MP

  yieldPerAcre = 19;
  mandiPrice = 2425;
  seedCost = 2200;
  fertilizerCost = 3600;
  irrigationCost = 2200;
  laborCost = 5500;
  miscCost = 1000;

  totalCostPerAcre = 0;
  grossRevenuePerAcre = 0;
  netProfitPerAcre = 0;

  totalFarmExpense = 0;
  totalFarmRevenue = 0;
  totalFarmNetProfit = 0;
  profitMarginPercent = 0;
  roiPercent = 0;

  // Contact / Lead Form State
  farmerName = '';
  farmerMobile = '';
  farmerDistrict = '';
  farmerLoanRequirement = 'KCC Loan Assistance';

  ngOnInit(): void {
    this.setupSeoAndSchema();
    this.calculateLoan();
    this.calculateKusum();
    this.calculateCropProfit();
  }

  private setupSeoAndSchema(): void {
    this.seoService.updateSeo({
      title: 'Agri Financial Calculator | किसान KCC लोन EMI, PM-KUSUM सब्सिडी व फसल लाभ कैलकुलेटर | KrisiMarg',
      description: 'KrisiMarg किसान वित्तीय कैलकुलेटर: KCC ऋण EMI, 3% सरकारी ब्याज छूट, PM-KUSUM 60% सोलर पंप सब्सिडी और फसल उपज व शुद्ध मुनाफे (Crop ROI) की सटीक गणना करें।',
      keywords: 'Agri Financial Calculator, Kisan Loan Calculator, KCC EMI Calculator, PM Kusum Solar Pump Subsidy, Crop Profit Calculator, Fasal Labh Calculator, Tractor Loan EMI, Kisan Credit Card Scheme, Agriculture Loan Interest Subvention, Krishi Marg',
      url: '/agri-calculator'
    });

    // JSON-LD Structured Schema
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          'name': 'KrisiMarg Agri Financial & KCC Loan Calculator',
          'url': 'https://krisimarg.com/agri-calculator',
          'applicationCategory': 'FinanceApplication',
          'operatingSystem': 'All',
          'browserRequirements': 'Requires JavaScript. Requires HTML5.',
          'description': 'Free online Agriculture financial calculator for Indian farmers to calculate KCC Loan EMI, PM-KUSUM 60% Solar Pump Subsidies, and crop yield ROI.',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'INR'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'KrisiMarg Technologies',
            'url': 'https://krisimarg.com'
          }
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'किसान क्रेडिट कार्ड (KCC) पर कितना ब्याज लगता है?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'KCC पर सामान्य ब्याज दर 7% होती है। ₹3 लाख तक के ऋण पर समय पर अदायगी करने पर केंद्र सरकार द्वारा 3% शीघ्र चुकौती प्रोत्साहन (Prompt Repayment Incentive) मिलता है, जिससे शुद्ध ब्याज दर केवल 4% प्रति वर्ष रह जाती है।'
              }
            },
            {
              '@type': 'Question',
              'name': 'बिना गारंटी (Collateral-Free) KCC पर कितना लोन मिलता है?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'भारतीय रिजर्व बैंक (RBI) के नियमानुसार बिना किसी भूमि बंधक या गारंटी के किसान ₹1.60 लाख तक का KCC ऋण प्राप्त कर सकते हैं।'
              }
            },
            {
              '@type': 'Question',
              'name': 'PM-KUSUM योजना में सोलर पंप पर कितनी सरकारी सब्सिडी मिलती है?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'PM-KUSUM Component-B के तहत किसानों को कुल 60% सब्सिडी (30% केंद्र सरकार + 30% राज्य सरकार) मिलती है। किसान को केवल 40% योगदान देना होता है, जिसमें से 30% तक बैंक लोन भी मिल सकता है और किसान का नकद हिस्सा केवल 10% रहता है।'
              }
            }
          ]
        }
      ]
    };

    this.seoService.setJsonLd(schema, 'agri-calc-schema');
  }

  // ==========================================
  // TAB CONTROLS
  // ==========================================
  setActiveTab(tab: 'kcc-loan' | 'pm-kusum' | 'crop-profit'): void {
    this.activeTab = tab;
  }

  // ==========================================
  // 1. KCC LOAN LOGIC
  // ==========================================
  selectLoanType(typeId: string): void {
    this.selectedLoanType = typeId;
    const config = this.loanTypes.find(t => t.id === typeId);
    if (config) {
      this.interestRate = config.defaultRate;
      this.tenureYears = config.defaultTenure;
      this.loanAmount = config.defaultAmount;
      this.calculateLoan();
    }
  }

  setAmountPreset(amount: number): void {
    this.loanAmount = amount;
    this.calculateLoan();
  }

  calculateLoan(): void {
    const P = Math.max(1000, Number(this.loanAmount) || 0);
    const annualRate = Math.max(0.1, Number(this.interestRate) || 0);
    const tenureMonths = Math.max(1, (Number(this.tenureYears) || 1) * 12);

    const r = annualRate / (12 * 100);
    const emi = (P * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);

    this.monthlyEmi = Math.round(emi);
    this.totalPayment = Math.round(emi * tenureMonths);
    this.totalInterest = Math.max(0, this.totalPayment - P);

    const total = P + this.totalInterest;
    this.principalPercent = Math.round((P / total) * 100);
    this.interestPercent = 100 - this.principalPercent;

    // KCC 3% prompt repayment subsidy calculation (Up to 3 Lakhs)
    if (this.selectedLoanType === 'kcc' && P <= 300000) {
      const discountedRate = Math.max(0.1, annualRate - 3.0);
      const discountedR = discountedRate / (12 * 100);
      const discountedEmi = (P * discountedR * Math.pow(1 + discountedR, tenureMonths)) / (Math.pow(1 + discountedR, tenureMonths) - 1);
      const discountedTotal = Math.round(discountedEmi * tenureMonths);
      this.kccSubventionSavings = Math.max(0, this.totalPayment - discountedTotal);
    } else {
      this.kccSubventionSavings = 0;
    }
  }

  // ==========================================
  // 2. PM-KUSUM SOLAR PUMP LOGIC
  // ==========================================
  selectHp(hp: number): void {
    this.selectedHp = hp;
    this.calculateKusum();
  }

  calculateKusum(): void {
    const option = this.kusumHpOptions.find(o => o.hp === this.selectedHp) || this.kusumHpOptions[1];
    
    // Base benchmark cost adjusted for pump type
    const multiplier = this.pumpType === 'submersible' ? 1.0 : 0.92;
    this.kusumTotalBenchmarkCost = Math.round(option.benchmarkCost * multiplier);

    this.kusumCentralSubsidy = Math.round((this.kusumTotalBenchmarkCost * option.centralSubsidyPct) / 100);
    this.kusumStateSubsidy = Math.round((this.kusumTotalBenchmarkCost * option.stateSubsidyPct) / 100);
    this.kusumTotalSubsidy = this.kusumCentralSubsidy + this.kusumStateSubsidy;

    // Farmer share (40%)
    this.kusumFarmerShareTotal = this.kusumTotalBenchmarkCost - this.kusumTotalSubsidy;
    this.kusumBankLoanShare = Math.round((this.kusumTotalBenchmarkCost * 30) / 100); // 30% bank loan
    this.kusumFarmerCashShare = this.kusumTotalBenchmarkCost - this.kusumTotalSubsidy - this.kusumBankLoanShare; // 10% cash

    // Annual diesel savings
    const dieselLitre = option.dieselSavedLitre;
    this.kusumAnnualDieselSavings = Math.round(dieselLitre * this.dieselPricePerLitre);

    // Payback period
    if (this.kusumAnnualDieselSavings > 0) {
      this.kusumPaybackYears = Number((this.kusumFarmerCashShare / this.kusumAnnualDieselSavings).toFixed(1));
    }
  }

  // ==========================================
  // 3. CROP PROFIT LOGIC
  // ==========================================
  selectCropPreset(cropId: string): void {
    this.selectedCropId = cropId;
    const crop = this.cropPresets.find(c => c.id === cropId);
    if (crop) {
      this.yieldPerAcre = crop.avgYieldPerAcre;
      this.mandiPrice = crop.mandiPricePerQuintal;
      this.seedCost = crop.seedCostPerAcre;
      this.fertilizerCost = crop.fertCostPerAcre;
      this.irrigationCost = crop.irrigationCostPerAcre;
      this.laborCost = crop.laborPrepCostPerAcre;
      this.miscCost = crop.miscCostPerAcre;
      this.calculateCropProfit();
    }
  }

  setLandUnit(unit: 'acre' | 'bigha'): void {
    if (this.landUnit !== unit) {
      this.landUnit = unit;
      this.calculateCropProfit();
    }
  }

  calculateCropProfit(): void {
    // Standardize area in acres for computation
    // 1 Acre = 1.6 Standard Bigha (approx in North India)
    const effectiveAcres = this.landUnit === 'acre' ? Number(this.landArea) || 1 : (Number(this.landArea) || 1) / 1.6;

    // Per acre metrics
    this.totalCostPerAcre = Number(this.seedCost) + Number(this.fertilizerCost) + Number(this.irrigationCost) + Number(this.laborCost) + Number(this.miscCost);
    this.grossRevenuePerAcre = Number(this.yieldPerAcre) * Number(this.mandiPrice);
    this.netProfitPerAcre = this.grossRevenuePerAcre - this.totalCostPerAcre;

    // Entire farm metrics
    this.totalFarmExpense = Math.round(this.totalCostPerAcre * effectiveAcres);
    this.totalFarmRevenue = Math.round(this.grossRevenuePerAcre * effectiveAcres);
    this.totalFarmNetProfit = this.totalFarmRevenue - this.totalFarmExpense;

    if (this.totalFarmExpense > 0) {
      this.roiPercent = Math.round((this.totalFarmNetProfit / this.totalFarmExpense) * 100);
      this.profitMarginPercent = Math.round((this.totalFarmNetProfit / this.totalFarmRevenue) * 100);
    } else {
      this.roiPercent = 0;
      this.profitMarginPercent = 0;
    }
  }

  // ==========================================
  // WHATSAPP ADVISORY & CONSULTATION
  // ==========================================
  applyGeneralAdvisory(): void {
    let msg = '';
    if (this.activeTab === 'kcc-loan') {
      const type = this.loanTypes.find(t => t.id === this.selectedLoanType)?.nameHi || 'Agri Loan';
      msg = `नमस्ते KrisiMarg टीम, मुझे ${type} सहायता चाहिए।\n\n📌 लोन राशि: ₹${this.loanAmount.toLocaleString('en-IN')}\n📌 ब्याज दर: ${this.interestRate}%\n📌 अवधि: ${this.tenureYears} वर्ष\n📌 अनुमानित EMI: ₹${this.monthlyEmi.toLocaleString('en-IN')}/माह\n\nकृपया मुझे बैंक आवेदन प्रक्रिया और सरकारी सब्सिडी मार्गदर्शन प्रदान करें।`;
    } else if (this.activeTab === 'pm-kusum') {
      msg = `नमस्ते KrisiMarg टीम, मुझे PM-KUSUM सोलर पंप योजना (${this.selectedHp} HP - ${this.pumpType}) सब्सिडी के लिए आवेदन सहायता चाहिए।\n\n📌 सोलर पंप क्षमता: ${this.selectedHp} HP\n📌 कुल अनुमानित लागत: ₹${this.kusumTotalBenchmarkCost.toLocaleString('en-IN')}\n📌 60% सरकारी सब्सिडी: ₹${this.kusumTotalSubsidy.toLocaleString('en-IN')}\n📌 किसान हिस्सा: ₹${this.kusumFarmerShareTotal.toLocaleString('en-IN')}\n\nकृपया मेरे जिले के लिए आवेदन प्रक्रिया बताएं।`;
    } else {
      const crop = this.cropPresets.find(c => c.id === this.selectedCropId)?.nameHi || 'फसल';
      msg = `नमस्ते KrisiMarg टीम, मुझे ${crop} की खेती (${this.landArea} ${this.landUnit}) पर वित्तीय सलाह और मंडी भाव लिंकिंग सहायता चाहिए।\n\n📌 अनुमानित लागत: ₹${this.totalFarmExpense.toLocaleString('en-IN')}\n📌 अनुमानित आय: ₹${this.totalFarmRevenue.toLocaleString('en-IN')}\n📌 शुद्ध लाभ: ₹${this.totalFarmNetProfit.toLocaleString('en-IN')}\n\nकृपया मेरी उपज को सीधे खरीदारों से जोड़ने में सहायता करें।`;
    }

    if (this.farmerName) {
      msg += `\n\nकिसान नाम: ${this.farmerName}\nमोबाइल: ${this.farmerMobile || 'N/A'}\nजिला: ${this.farmerDistrict || 'N/A'}`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/917219159731?text=${encoded}`, '_blank');
  }
}
