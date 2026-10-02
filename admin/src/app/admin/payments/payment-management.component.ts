import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentTransaction, PaymentSummary } from '../../core/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './payment-management.component.html',
  styleUrl: './payment-management.component.scss'
})
export class PaymentManagementComponent implements OnInit {
  private paymentService = inject(PaymentService);

  payments: PaymentTransaction[] = [];
  summary: PaymentSummary = {
    totalVolume: 0,
    totalListingFees: 0,
    totalCommission: 0,
    totalTransactions: 0
  };

  isLoading = true;
  isSaving = false;

  searchQuery = '';
  selectedStatus = 'all';
  selectedPurpose = 'all';

  showModal = false;

  manualForm: Partial<PaymentTransaction> = this.getEmptyForm();

  ngOnInit(): void {
    this.loadPayments();
  }

  getEmptyForm(): Partial<PaymentTransaction> {
    return {
      farmerName: '',
      farmerMobile: '',
      amount: 99,
      purpose: 'crop_listing_fee',
      paymentMode: 'Cash / Manual UPI',
      status: 'received',
      transactionId: '',
      notes: ''
    };
  }

  loadPayments(): void {
    this.isLoading = true;
    const filters: any = {};
    if (this.selectedStatus !== 'all') filters.status = this.selectedStatus;
    if (this.selectedPurpose !== 'all') filters.purpose = this.selectedPurpose;
    if (this.searchQuery.trim()) filters.search = this.searchQuery.trim();

    this.paymentService.getAllPayments(filters).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success) {
          this.payments = res.data || [];
          if (res.summary) {
            this.summary = res.summary;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching payments:', err);
      }
    });
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.loadPayments();
  }

  setPurposeFilter(purpose: string): void {
    this.selectedPurpose = purpose;
    this.loadPayments();
  }

  openManualModal(): void {
    this.manualForm = this.getEmptyForm();
    this.manualForm.transactionId = `TXN_OFFLINE_${Date.now()}`;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  savePayment(): void {
    if (!this.manualForm.farmerName || !this.manualForm.amount) {
      Swal.fire('अधूरा विवरण', 'कृपया किसान का नाम और भुगतान राशि अवश्य भरें।', 'warning');
      return;
    }

    this.isSaving = true;
    this.paymentService.recordManualPayment(this.manualForm).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          Swal.fire('सफल!', 'भुगतान प्रविष्टि सफलतापूर्वक दर्ज कर ली गई।', 'success');
          this.closeModal();
          this.loadPayments();
        }
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire('त्रुटि', err.error?.message || 'भुगतान दर्ज नहीं हो सका', 'error');
      }
    });
  }

  deletePayment(p: PaymentTransaction): void {
    if (!p._id) return;

    Swal.fire({
      title: 'भुगतान रिकॉर्ड हटाएं?',
      text: `क्या आप ₹${p.amount} का लेनदेन (${p.transactionId || ''}) हटाना चाहते हैं?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'हाँ, हटाएं',
      cancelButtonText: 'रद्द करें'
    }).then((res) => {
      if (res.isConfirmed) {
        this.paymentService.deletePayment(p._id!).subscribe({
          next: () => {
            Swal.fire('हटा दिया गया!', 'भुगतान रिकॉर्ड हटा दिया गया।', 'success');
            this.loadPayments();
          },
          error: (err) => {
            Swal.fire('त्रुटि', err.error?.message || 'हटाने में विफल', 'error');
          }
        });
      }
    });
  }
}
