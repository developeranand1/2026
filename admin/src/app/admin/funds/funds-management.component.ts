import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffOpsService } from '../../core/staff-ops.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-funds-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funds-management.component.html',
  styleUrl: './funds-management.component.scss'
})
export class FundsManagementComponent implements OnInit {
  private staffOps = inject(StaffOpsService);

  overview: any = null;
  transactions: any[] = [];
  isLoading = false;

  // Filters
  filterDirection = '';
  filterType = '';

  // New Transaction Modal State
  showModal = false;
  newTx: any = {
    title: '',
    type: 'INVESTMENT_IN',
    direction: 'INFLOW',
    amount: null,
    paymentMode: 'BANK_TRANSFER',
    transactionReference: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    investorDetails: {
      name: '',
      organization: '',
      mobile: '',
      email: '',
      equityPercentage: 0
    }
  };

  ngOnInit(): void {
    this.loadOverview();
    this.loadTransactions();
  }

  loadOverview(): void {
    this.staffOps.getFundOverview().subscribe({
      next: (res) => {
        if (res.success) this.overview = res.data;
      },
      error: (err) => console.error('Overview load error:', err)
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.filterDirection) params.direction = this.filterDirection;
    if (this.filterType) params.type = this.filterType;

    this.staffOps.getFundTransactions(params).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.transactions = res.data;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Transactions load error:', err);
      }
    });
  }

  openCreateModal(defaultType: string = 'INVESTMENT_IN'): void {
    this.newTx = {
      title: '',
      type: defaultType,
      direction: defaultType === 'INVESTMENT_IN' || defaultType === 'REVENUE_IN' ? 'INFLOW' : 'OUTFLOW',
      amount: null,
      paymentMode: 'BANK_TRANSFER',
      transactionReference: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      investorDetails: {
        name: '',
        organization: '',
        mobile: '',
        email: '',
        equityPercentage: 0
      }
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onTypeChange(): void {
    if (this.newTx.type === 'INVESTMENT_IN' || this.newTx.type === 'REVENUE_IN') {
      this.newTx.direction = 'INFLOW';
    } else {
      this.newTx.direction = 'OUTFLOW';
    }
  }

  submitTransaction(): void {
    if (!this.newTx.title || !this.newTx.amount) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please enter transaction title and valid amount.',
        icon: 'warning',
        confirmButtonColor: '#198754'
      });
      return;
    }

    this.staffOps.recordFundTransaction(this.newTx).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            title: 'Recorded!',
            text: 'Fund transaction entered into ledger successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadOverview();
          this.loadTransactions();
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Failed to record transaction',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
