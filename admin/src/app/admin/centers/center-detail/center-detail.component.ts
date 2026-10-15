import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CenterService, Center, CenterSellerEntry, CenterSellerSummary } from '../../../core/center.service';
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

  // Modal / Inline Form state to Add New Farmer / Seller
  showAddSellerModal = false;
  showInlineForm = false;

  toggleInlineForm(): void {
    this.showInlineForm = !this.showInlineForm;
    if (this.showInlineForm) {
      this.calculateAmounts();
    }
  }

  // Token Slip Print Modal
  showPrintSlipModal = false;
  selectedSlipEntry: CenterSellerEntry | null = null;

  // Popular crops for quick selection
  cropOptions = [
    'Wheat (गेहूँ)',
    'Paddy (धान / चावल)',
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

  // New Seller Form Data
  newSeller = {
    farmerName: '',
    farmerMobile: '',
    village: '',
    cropName: 'Wheat (गेहूँ)',
    variety: 'Grade A / Sharbati',
    quantity: 10,
    unit: 'Quintal',
    pricePerQuintal: 2350,
    totalAmount: 23500,
    paymentMode: 'Cash' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
    paymentStatus: 'Paid' as 'Paid' | 'Pending' | 'Partial',
    paidAmount: 23500,
    dueAmount: 0,
    transactionId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    weighedBy: '',
    notes: '',
    status: 'Payment Completed' as 'Token Issued' | 'Weighed & Verified' | 'Payment Completed' | 'Cancelled'
  };

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
      village: '',
      cropName: 'Wheat (गेहूँ)',
      variety: 'Grade A / Sharbati',
      quantity: 10,
      unit: 'Quintal',
      pricePerQuintal: 2350,
      totalAmount: 23500,
      paymentMode: 'Cash',
      paymentStatus: 'Paid',
      paidAmount: 23500,
      dueAmount: 0,
      transactionId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      weighedBy: this.center?.workers?.[0]?.name || 'Center Operator',
      notes: '',
      status: 'Payment Completed'
    };
    this.calculateAmounts();
    this.showAddSellerModal = true;
  }

  closeAddSellerModal(): void {
    this.showAddSellerModal = false;
  }

  saveSellerEntry(): void {
    if (!this.newSeller.farmerName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Farmer Name Required', text: 'Please enter farmer / seller name' });
      return;
    }
    if (!this.newSeller.farmerMobile.trim() || this.newSeller.farmerMobile.trim().length < 10) {
      Swal.fire({ icon: 'warning', title: 'Valid Mobile Required', text: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    if (!this.newSeller.quantity || this.newSeller.quantity <= 0) {
      Swal.fire({ icon: 'warning', title: 'Quantity Required', text: 'Please enter produce quantity in Quintals' });
      return;
    }
    if (!this.newSeller.pricePerQuintal || this.newSeller.pricePerQuintal <= 0) {
      Swal.fire({ icon: 'warning', title: 'Price Required', text: 'Please enter rate per Quintal' });
      return;
    }

    if (!this.centerId) return;

    this.isSavingSeller = true;

    this.centerService.addCenterSeller(this.centerId, this.newSeller).subscribe({
      next: (res) => {
        this.isSavingSeller = false;
        this.showAddSellerModal = false;

        Swal.fire({
          icon: 'success',
          title: `Token #${res.data.tokenNumber} Generated!`,
          html: `Farmer <b>${res.data.farmerName}</b> produce has been recorded.<br>Produce: <b>${res.data.quantity} Quintal (${res.data.cropName})</b><br>Amount: <b>₹${res.data.totalAmount}</b>`,
          showCancelButton: true,
          confirmButtonText: '<i class="bi bi-printer"></i> Print Token Slip',
          cancelButtonText: 'Done',
          confirmButtonColor: '#10b981'
        }).then((choice) => {
          if (choice.isConfirmed) {
            this.openPrintSlip(res.data);
          }
        });

        this.loadCenterSellers(this.centerId!);
      },
      error: (err) => {
        this.isSavingSeller = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to Save Entry',
          text: err?.error?.message || 'Could not record farmer produce'
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
