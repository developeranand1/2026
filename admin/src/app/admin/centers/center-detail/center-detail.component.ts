import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CenterService, Center, CenterSellerEntry, CenterSellerSummary, FarmerSearchResult } from '../../../core/center.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-center-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, RouterModule],
  templateUrl: './center-detail.component.html',
  styleUrl: './center-detail.component.scss'
})
export class CenterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private centerService = inject(CenterService);

  centerId: string | null = null;
  center: Center | null = null;
  sellers: CenterSellerEntry[] = [];
  filteredSellers: CenterSellerEntry[] = [];
  summary: CenterSellerSummary = {
    totalSellers: 0,
    totalQuantityQuintal: 0,
    totalPayout: 0,
    totalPaid: 0,
    totalDue: 0
  };

  isLoading = true;
  isSavingSeller = false;

  // Search & Filter for Sellers
  sellerSearch = '';
  selectedPaymentFilter = 'all';
  selectedCropFilter = 'all';

  // Farmer Search & Selection State
  farmerSearchQuery = '';
  isSearchingFarmers = false;
  farmerSearchResults: FarmerSearchResult[] = [];
  selectedFarmer: FarmerSearchResult | null = null;
  showFarmerDropdown = false;

  // Quick Farmer Registration State
  showQuickRegisterFarmer = false;
  isRegisteringFarmer = false;
  newFarmer = {
    name: '',
    mobile: '',
    village: '',
    password: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  };

  // Modal / Inline Form state to Add New Farmer / Seller
  showAddSellerModal = false;
  showInlineForm = false;

  toggleInlineForm(): void {
    this.showInlineForm = !this.showInlineForm;
    if (this.showInlineForm) {
      this.calculateAmounts();
      if (!this.selectedFarmer) {
        this.searchRegisteredFarmers();
      }
    }
  }

  // Token Slip Print Modal
  showPrintSlipModal = false;
  selectedSlipEntry: CenterSellerEntry | null = null;

  // Popular crops for quick selection
  cropOptions = [
    'Paddy / Dhan (धान)',
    'Wheat (गेहूँ)',
    'Mustard (सरसों)',
    'Gram / Chickpea (चना)',
    'Maize (मक्का)',
    'Soybean (सोयाबीन)',
    'Barley (जौ)',
    'Potato (आलू)',
    'Onion (प्याज़)',
    'Sugarcane (गन्ना)',
    'Pulses / Arhar (अरहर दाल)'
  ];

  // Stage 1: Issue Token Data (Only Farmer & Scheduled Selling Produce info)
  newSeller = {
    farmerName: '',
    farmerMobile: '',
    farmerPassword: '',
    village: '',
    cropName: 'Paddy / Dhan (धान)',
    variety: 'Common / Grade A (मोटा/बारीक)',
    quantity: 25,
    expectedQuantity: 25,
    unit: 'Quintal',
    pricePerQuintal: 0,
    totalAmount: 0,
    sellingDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
    paymentStatus: 'Pending' as 'Paid' | 'Pending' | 'Partial',
    paidAmount: 0,
    dueAmount: 0,
    transactionId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    weighedBy: '',
    notes: '',
    status: 'Token Issued' as 'Token Issued' | 'Weighed & Verified' | 'Payment Completed' | 'Cancelled'
  };

  // Stage 2: Weighing, Final Sale & Payment Modal State
  showWeighingModal = false;
  isSavingWeighing = false;
  selectedEntryForWeighing: CenterSellerEntry | null = null;
  weighingData = {
    quantity: 25,
    pricePerQuintal: 2320,
    totalAmount: 58000,
    paymentMode: 'Bank Transfer' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
    paymentStatus: 'Paid' as 'Paid' | 'Pending' | 'Partial',
    paidAmount: 58000,
    dueAmount: 0,
    transactionId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    weighedBy: '',
    notes: ''
  };

  searchRegisteredFarmers(): void {
    this.isSearchingFarmers = true;
    this.centerService.searchFarmers(this.farmerSearchQuery).subscribe({
      next: (res) => {
        this.farmerSearchResults = res.data || [];
        this.isSearchingFarmers = false;
        this.showFarmerDropdown = true;
      },
      error: (err) => {
        console.error('Farmer search error:', err);
        this.isSearchingFarmers = false;
      }
    });
  }

  selectFarmer(farmer: FarmerSearchResult): void {
    this.selectedFarmer = farmer;
    this.newSeller.farmerName = farmer.name;
    this.newSeller.farmerMobile = farmer.mobile;
    this.newSeller.village = farmer.village || '';
    if (farmer.bankDetails) {
      this.newSeller.bankName = farmer.bankDetails.bankName || '';
      this.newSeller.accountNumber = farmer.bankDetails.accountNumber || '';
      this.newSeller.ifscCode = farmer.bankDetails.ifscCode || '';
    }
    this.showFarmerDropdown = false;
    this.showQuickRegisterFarmer = false;
  }

  clearSelectedFarmer(): void {
    this.selectedFarmer = null;
    this.farmerSearchQuery = '';
    this.farmerSearchResults = [];
    this.newSeller.farmerName = '';
    this.newSeller.farmerMobile = '';
    this.newSeller.village = '';
    this.newSeller.farmerPassword = '';
  }

  toggleQuickRegisterFarmer(): void {
    this.showQuickRegisterFarmer = !this.showQuickRegisterFarmer;
    if (this.showQuickRegisterFarmer) {
      this.newFarmer = {
        name: this.farmerSearchQuery && isNaN(Number(this.farmerSearchQuery)) ? this.farmerSearchQuery : '',
        mobile: this.farmerSearchQuery && !isNaN(Number(this.farmerSearchQuery)) ? this.farmerSearchQuery : '',
        village: '',
        password: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
      };
    }
  }

  registerNewFarmer(): void {
    if (!this.newFarmer.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Name Required', text: 'Please enter farmer name' });
      return;
    }
    if (!this.newFarmer.mobile.trim() || this.newFarmer.mobile.trim().length < 10) {
      Swal.fire({ icon: 'warning', title: 'Valid Mobile Required', text: 'Please enter 10-digit mobile number' });
      return;
    }

    this.isRegisteringFarmer = true;
    const payload = {
      name: this.newFarmer.name.trim(),
      mobile: this.newFarmer.mobile.trim(),
      village: this.newFarmer.village.trim(),
      password: this.newFarmer.password.trim() || ('Farmer@' + this.newFarmer.mobile.trim().slice(-4)),
      bankDetails: {
        bankName: this.newFarmer.bankName.trim(),
        accountNumber: this.newFarmer.accountNumber.trim(),
        ifscCode: this.newFarmer.ifscCode.trim()
      }
    };

    this.centerService.quickRegisterFarmer(payload).subscribe({
      next: (res) => {
        this.isRegisteringFarmer = false;
        Swal.fire({
          icon: 'success',
          title: 'Farmer Registered!',
          text: `${res.data.name} is now registered with Farmer role and ready for produce intake.`,
          timer: 2000,
          showConfirmButton: false
        });
        this.selectFarmer(res.data);
      },
      error: (err) => {
        this.isRegisteringFarmer = false;
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: err?.error?.message || 'Could not register farmer'
        });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.centerId = params.get('id');
      if (this.centerId) {
        this.loadCenterDetails(this.centerId);
        this.loadCenterSellers(this.centerId);
      } else {
        this.router.navigate(['/admin/centers']);
      }
    });
  }

  loadCenterDetails(id: string): void {
    this.isLoading = true;
    this.centerService.getCenterById(id).subscribe({
      next: (res) => {
        this.center = res.data;
        if (this.center && this.center.workers && this.center.workers.length > 0) {
          this.newSeller.weighedBy = this.center.workers[0].name;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load center details:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'Center details could not be found'
        });
        this.router.navigate(['/admin/centers']);
      }
    });
  }

  loadCenterSellers(id: string): void {
    this.centerService.getCenterSellers(id).subscribe({
      next: (res) => {
        this.sellers = res.data || [];
        this.summary = res.summary || {
          totalSellers: 0,
          totalQuantityQuintal: 0,
          totalPayout: 0,
          totalPaid: 0,
          totalDue: 0
        };
        this.applySellerFilter();
      },
      error: (err) => {
        console.error('Failed to load sellers:', err);
      }
    });
  }

  applySellerFilter(): void {
    let list = [...this.sellers];

    if (this.selectedPaymentFilter !== 'all') {
      list = list.filter(s => s.paymentDetails?.paymentStatus === this.selectedPaymentFilter);
    }

    if (this.selectedCropFilter !== 'all') {
      list = list.filter(s => s.cropName?.toLowerCase().includes(this.selectedCropFilter.toLowerCase()));
    }

    if (this.sellerSearch.trim()) {
      const q = this.sellerSearch.toLowerCase().trim();
      list = list.filter(s =>
        s.tokenNumber?.toLowerCase().includes(q) ||
        s.farmerName?.toLowerCase().includes(q) ||
        s.farmerMobile?.toLowerCase().includes(q) ||
        s.cropName?.toLowerCase().includes(q) ||
        s.village?.toLowerCase().includes(q)
      );
    }

    this.filteredSellers = list;
  }

  // Recalculate totals dynamically as user types Qty & Rate
  calculateAmounts(): void {
    const qty = parseFloat(this.newSeller.quantity as any) || 0;
    const price = parseFloat(this.newSeller.pricePerQuintal as any) || 0;
    this.newSeller.totalAmount = Math.round(qty * price * 100) / 100;

    if (this.newSeller.paymentStatus === 'Paid') {
      this.newSeller.paidAmount = this.newSeller.totalAmount;
      this.newSeller.dueAmount = 0;
    } else if (this.newSeller.paymentStatus === 'Pending') {
      this.newSeller.paidAmount = 0;
      this.newSeller.dueAmount = this.newSeller.totalAmount;
    } else if (this.newSeller.paymentStatus === 'Partial') {
      const paid = parseFloat(this.newSeller.paidAmount as any) || 0;
      this.newSeller.dueAmount = Math.max(0, this.newSeller.totalAmount - paid);
    }
  }

  onPaymentStatusChange(): void {
    this.calculateAmounts();
  }

  openAddSellerModal(): void {
    this.newSeller = {
      farmerName: '',
      farmerMobile: '',
      farmerPassword: '',
      village: '',
      cropName: 'Paddy / Dhan (धान)',
      variety: 'Common / Grade A (मोटा/बारीक)',
      quantity: 0,
      expectedQuantity: 25,
      unit: 'Quintal',
      pricePerQuintal: 0,
      totalAmount: 0,
      sellingDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      paymentStatus: 'Pending',
      paidAmount: 0,
      dueAmount: 0,
      transactionId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      weighedBy: this.center?.workers?.[0]?.name || 'Center Operator',
      notes: '',
      status: 'Token Issued'
    };
    this.farmerSearchQuery = '';
    this.farmerSearchResults = [];
    this.selectedFarmer = null;
    this.showQuickRegisterFarmer = false;
    this.showAddSellerModal = true;
  }

  closeAddSellerModal(): void {
    this.showAddSellerModal = false;
  }

  openWeighingModal(entry: CenterSellerEntry): void {
    this.selectedEntryForWeighing = entry;
    const qty = entry.quantity > 0 ? entry.quantity : (entry.expectedQuantity || 25);
    const price = entry.pricePerQuintal > 0 ? entry.pricePerQuintal : (entry.cropName.includes('Dhan') || entry.cropName.includes('Paddy') ? 2320 : 2275);
    const total = Math.round(qty * price * 100) / 100;

    this.weighingData = {
      quantity: qty,
      pricePerQuintal: price,
      totalAmount: total,
      paymentMode: (entry.paymentDetails?.paymentMode as any) || 'Bank Transfer',
      paymentStatus: 'Paid',
      paidAmount: total,
      dueAmount: 0,
      transactionId: entry.paymentDetails?.transactionId || '',
      bankName: entry.paymentDetails?.bankName || '',
      accountNumber: entry.paymentDetails?.accountNumber || '',
      ifscCode: entry.paymentDetails?.ifscCode || '',
      weighedBy: entry.weighedBy || this.center?.workers?.[0]?.name || 'Center Weighing Operator',
      notes: entry.notes || ''
    };
    this.calculateWeighingAmounts();
    this.showWeighingModal = true;
  }

  closeWeighingModal(): void {
    this.showWeighingModal = false;
    this.selectedEntryForWeighing = null;
  }

  calculateWeighingAmounts(): void {
    const qty = parseFloat(this.weighingData.quantity as any) || 0;
    const price = parseFloat(this.weighingData.pricePerQuintal as any) || 0;
    this.weighingData.totalAmount = Math.round(qty * price * 100) / 100;

    if (this.weighingData.paymentStatus === 'Paid') {
      this.weighingData.paidAmount = this.weighingData.totalAmount;
      this.weighingData.dueAmount = 0;
    } else if (this.weighingData.paymentStatus === 'Pending') {
      this.weighingData.paidAmount = 0;
      this.weighingData.dueAmount = this.weighingData.totalAmount;
    } else if (this.weighingData.paymentStatus === 'Partial') {
      const paid = parseFloat(this.weighingData.paidAmount as any) || 0;
      this.weighingData.dueAmount = Math.max(0, this.weighingData.totalAmount - paid);
    }
  }

  onWeighingPaymentStatusChange(): void {
    this.calculateWeighingAmounts();
  }

  submitWeighingAndPayment(): void {
    if (!this.selectedEntryForWeighing?._id) return;
    if (!this.weighingData.quantity || this.weighingData.quantity <= 0) {
      Swal.fire({ icon: 'warning', title: 'Weight Required', text: 'Please enter actual weighed quantity in Quintals' });
      return;
    }
    if (!this.weighingData.pricePerQuintal || this.weighingData.pricePerQuintal <= 0) {
      Swal.fire({ icon: 'warning', title: 'Rate Required', text: 'Please enter rate per Quintal' });
      return;
    }

    this.isSavingWeighing = true;
    this.centerService.completeCenterSale(this.selectedEntryForWeighing._id, this.weighingData).subscribe({
      next: (res) => {
        this.isSavingWeighing = false;
        this.showWeighingModal = false;
        this.openPrintSlip(res.data);
        Swal.fire({
          icon: 'success',
          title: `Produce Sold & Paid!`,
          html: `Token <b>#${res.data.tokenNumber}</b> sale completed.<br>Weight: <b>${res.data.quantity} Qtl</b> | Rate: <b>₹${res.data.pricePerQuintal}</b><br>Total Payout: <b>₹${res.data.totalAmount}</b>`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        this.loadCenterSellers(this.centerId!);
      },
      error: (err) => {
        this.isSavingWeighing = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Could not complete sale'
        });
      }
    });
  }

  saveSellerEntry(): void {
    if (!this.newSeller.farmerName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Farmer Name Required', text: 'Please select or enter farmer name' });
      return;
    }
    if (!this.newSeller.farmerMobile.trim() || this.newSeller.farmerMobile.trim().length < 10) {
      Swal.fire({ icon: 'warning', title: 'Valid Mobile Required', text: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    if (!this.newSeller.cropName) {
      Swal.fire({ icon: 'warning', title: 'Crop Required', text: 'Please select crop commodity' });
      return;
    }

    if (!this.centerId) return;

    this.isSavingSeller = true;
    this.newSeller.quantity = parseFloat(this.newSeller.expectedQuantity as any) || 0;
    this.newSeller.status = 'Token Issued';
    this.newSeller.paymentStatus = 'Pending';
    this.newSeller.pricePerQuintal = 0;
    this.newSeller.totalAmount = 0;
    this.newSeller.paidAmount = 0;
    this.newSeller.dueAmount = 0;

    this.centerService.addCenterSeller(this.centerId, this.newSeller).subscribe({
      next: (res) => {
        this.isSavingSeller = false;
        this.showAddSellerModal = false;

        // Auto-open Token Slip immediately for printing
        this.openPrintSlip(res.data);

        Swal.fire({
          icon: 'success',
          title: `Token #${res.data.tokenNumber} Issued!`,
          html: `Arrival Token generated for <b>${res.data.farmerName}</b>.<br>Expected: <b>${res.data.expectedQuantity || res.data.quantity} Qtl (${res.data.cropName})</b><br><small class="text-muted">Produce will be weighed and paid on arrival.</small>`,
          timer: 3000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });

        this.clearSelectedFarmer();
        this.loadCenterSellers(this.centerId!);
      },
      error: (err) => {
        this.isSavingSeller = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to Issue Token',
          text: err?.error?.message || 'Could not issue farmer token'
        });
      }
    });
  }

  deleteSeller(entry: CenterSellerEntry): void {
    if (!entry._id) return;

    Swal.fire({
      title: `Delete Token #${entry.tokenNumber}?`,
      text: `Are you sure you want to remove the sale record of farmer ${entry.farmerName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then((res) => {
      if (res.isConfirmed) {
        this.centerService.deleteCenterSeller(entry._id!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Seller record removed',
              timer: 1500,
              showConfirmButton: false
            });
            if (this.centerId) {
              this.loadCenterSellers(this.centerId);
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: err?.error?.message || 'Could not delete entry'
            });
          }
        });
      }
    });
  }

  openPrintSlip(entry: CenterSellerEntry): void {
    this.selectedSlipEntry = entry;
    this.showPrintSlipModal = true;
  }

  closePrintSlip(): void {
    this.showPrintSlipModal = false;
    this.selectedSlipEntry = null;
  }

  printSlip(): void {
    window.print();
  }
}
