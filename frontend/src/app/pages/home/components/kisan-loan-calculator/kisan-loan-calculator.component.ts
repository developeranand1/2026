import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface LoanTypeOption {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  defaultRate: number;
  defaultTenure: number;
  defaultAmount: number;
  maxAmount: number;
  description: string;
}

@Component({
  selector: 'app-kisan-loan-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './kisan-loan-calculator.component.html',
  styleUrl: './kisan-loan-calculator.component.scss'
})
export class KisanLoanCalculatorComponent implements OnInit {

  loanTypes: LoanTypeOption[] = [
    {
      id: 'kcc',
      nameEn: 'Kisan Credit Card (KCC)',
      nameHi: 'किसान क्रेडिट कार्ड (KCC)',
      icon: 'bi-credit-card-2-front-fill',
      defaultRate: 7.0,
      defaultTenure: 1,
      defaultAmount: 160000,
      maxAmount: 500000,
      description: '₹3 लाख तक पर 3% शीघ्र भुगतान छूट (4% शुद्ध ब्याज दर)'
    },
    {
      id: 'tractor',
      nameEn: 'Tractor & Machinery Loan',
      nameHi: 'ट्रैक्टर व कृषि उपकरण ऋण',
      icon: 'bi-truck-front-fill',
      defaultRate: 9.5,
      defaultTenure: 5,
      defaultAmount: 500000,
      maxAmount: 1500000,
      description: 'नये व पुराने ट्रैक्टर, थ्रेशर, कंबाइन के लिए आसान किश्त'
    },
    {
      id: 'solar',
      nameEn: 'Solar Pump / Irrigation',
      nameHi: 'सोलर पंप व सिंचाई ऋण (KUSUM)',
      icon: 'bi-sun-fill',
      defaultRate: 8.5,
      defaultTenure: 4,
      defaultAmount: 200000,
      maxAmount: 800000,
      description: 'PM कुसुम योजना अंतर्गत सोलर पंप व ड्रिप सिंचाई सहायता'
    },
    {
      id: 'dairy',
      nameEn: 'Dairy & Animal Husbandry',
      nameHi: 'डेयरी व पशुपालन ऋण',
      icon: 'bi-shield-shaded',
      defaultRate: 8.0,
      defaultTenure: 3,
      defaultAmount: 150000,
      maxAmount: 600000,
      description: 'गाय, भैंस, मुर्गीपालन व शेड निर्माण हेतु रियायती ऋण'
    }
  ];

  selectedType: string = 'kcc';
  loanAmount: number = 160000;
  interestRate: number = 7.0;
  tenureYears: number = 1;

  // Amount preset chips
  amountPresets: number[] = [50000, 100000, 160000, 300000, 500000, 1000000];

  // Calculated values
  monthlyEmi: number = 0;
  totalInterest: number = 0;
  totalPayment: number = 0;
  principalPercent: number = 0;
  interestPercent: number = 0;
  kccSubventionSavings: number = 0;

  ngOnInit(): void {
    this.calculate();
  }

  selectLoanType(typeId: string): void {
    this.selectedType = typeId;
    const selected = this.loanTypes.find(t => t.id === typeId);
    if (selected) {
      this.interestRate = selected.defaultRate;
      this.tenureYears = selected.defaultTenure;
      this.loanAmount = selected.defaultAmount;
      this.calculate();
    }
  }

  setAmountPreset(amount: number): void {
    this.loanAmount = amount;
    this.calculate();
  }

  calculate(): void {
    const p = Number(this.loanAmount) || 0;
    const annualRate = Number(this.interestRate) || 0;
    const years = Number(this.tenureYears) || 1;
    const n = years * 12;

    if (p <= 0 || n <= 0) {
      this.monthlyEmi = 0;
      this.totalInterest = 0;
      this.totalPayment = 0;
      this.principalPercent = 100;
      this.interestPercent = 0;
      this.kccSubventionSavings = 0;
      return;
    }

    if (annualRate <= 0) {
      this.monthlyEmi = Math.round(p / n);
      this.totalInterest = 0;
      this.totalPayment = p;
      this.principalPercent = 100;
      this.interestPercent = 0;
      this.kccSubventionSavings = 0;
      return;
    }

    const r = (annualRate / 12) / 100;
    // Standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    this.monthlyEmi = Math.round(emi);
    this.totalPayment = Math.round(this.monthlyEmi * n);
    this.totalInterest = Math.max(0, this.totalPayment - p);

    // Percentages for bar chart
    if (this.totalPayment > 0) {
      this.principalPercent = Math.round((p / this.totalPayment) * 100);
      this.interestPercent = 100 - this.principalPercent;
    }

    // 3% KCC Prompt Repayment Subvention calculation (for loans up to 3 Lakhs)
    if (this.selectedType === 'kcc' && p <= 300000) {
      this.kccSubventionSavings = Math.round(p * 0.03 * years);
    } else {
      this.kccSubventionSavings = 0;
    }
  }

  applyLoanAdvisory(): void {
    const selected = this.loanTypes.find(t => t.id === this.selectedType);
    const loanName = selected ? selected.nameHi : 'कृषि ऋण';
    const amountStr = `₹${this.loanAmount.toLocaleString('en-IN')}`;
    const emiStr = `₹${this.monthlyEmi.toLocaleString('en-IN')}`;
    const rateStr = `${this.interestRate}%`;
    const tenureStr = `${this.tenureYears} वर्ष (${this.tenureYears * 12} माह)`;

    const text = encodeURIComponent(
      `🌾 *KisanMarg - कृषि ऋण व KCC सहायता परामर्श*\n\n• *ऋण का प्रकार:* ${loanName}\n• *आवश्यक ऋण राशि:* ${amountStr}\n• *ब्याज दर:* ${rateStr}\n• *अवधि:* ${tenureStr}\n• *अनुमानित मासिक EMI:* ${emiStr}\n\nकृपया मुझे नजदीकी बैंक शाखा/योजना अंतर्गत ऋण प्रक्रिया व दस्तावेज सहायता प्रदान करें।`
    );

    Swal.fire({
      title: `<div class="d-flex align-items-center justify-content-center gap-2 text-success">
                <i class="bi bi-bank2 fs-3"></i>
                <span class="fw-bold">किसान ऋण सहायता परामर्श</span>
              </div>`,
      html: `
        <div class="text-start py-2 fs-7 text-secondary">
          <div class="p-3 bg-success-subtle bg-opacity-25 rounded-4 border border-success-subtle mb-3">
            <h6 class="fw-bold text-dark mb-1">${loanName}</h6>
            <div class="row g-2 text-dark fs-8">
              <div class="col-6">
                <span class="text-muted d-block">ऋण राशि:</span>
                <strong class="text-success">${amountStr}</strong>
              </div>
              <div class="col-6">
                <span class="text-muted d-block">मासिक EMI:</span>
                <strong>${emiStr}</strong>
              </div>
            </div>
          </div>
          <p class="mb-3 text-dark fs-8">
            KisanMarg कृषि विशेषज्ञ आपको KCC नवीनीकरण, कम ब्याज दर एवं सरकारी सब्सिडी के लिए मार्गदर्शन करेंगे।
          </p>
          <div class="d-grid gap-2">
            <a href="https://wa.me/919876543210?text=${text}" target="_blank" class="btn btn-success py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
              <i class="bi bi-whatsapp fs-5"></i> व्हाट्सएप पर ऋण सहायता प्राप्त करें
            </a>
            <a href="tel:+919876543210" class="btn btn-outline-success py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-telephone-fill"></i> किसान हेल्पलाइन: +91 98765 43210
            </a>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'rounded-4 shadow-lg border-0'
      }
    });
  }
}
