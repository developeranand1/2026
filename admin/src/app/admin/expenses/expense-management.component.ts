import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffOpsService } from '../../core/staff-ops.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-management.component.html',
  styleUrl: './expense-management.component.scss'
})
export class ExpenseManagementComponent implements OnInit {
  private staffOps = inject(StaffOpsService);

  expenses: any[] = [];
  summary: any = null;
  isLoading = false;

  filterStatus = '';
  filterCategory = '';

  // Modal for Bill preview
  previewBillUrl: string | null = null;

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterCategory) params.category = this.filterCategory;

    this.staffOps.getAllExpenses(params).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.expenses = res.data;
          this.summary = res.summary;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Expenses load error:', err);
      }
    });
  }

  viewBill(url: string): void {
    if (!url) return;
    this.previewBillUrl = url;
  }

  closeBillPreview(): void {
    this.previewBillUrl = null;
  }

  reviewByHr(expense: any, action: 'APPROVE' | 'REJECT'): void {
    Swal.fire({
      title: `${action === 'APPROVE' ? 'Approve' : 'Reject'} Expense Claim?`,
      text: `Amount: ₹${expense.amount} for ${expense.staff?.name}`,
      input: 'text',
      inputPlaceholder: 'Optional HR review remarks...',
      icon: action === 'APPROVE' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'APPROVE' ? '#198754' : '#dc3545',
      confirmButtonText: action === 'APPROVE' ? 'Yes, Approve' : 'Yes, Reject'
    }).then((result) => {
      if (result.isConfirmed) {
        this.staffOps.reviewExpenseByHr(expense._id, action, result.value || '').subscribe({
          next: () => {
            Swal.fire({
              title: action === 'APPROVE' ? 'Approved!' : 'Rejected!',
              text: `Claim updated by HR.`,
              icon: 'success',
              timer: 1200,
              showConfirmButton: false
            });
            this.loadExpenses();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Review failed', 'error');
          }
        });
      }
    });
  }

  reimburseClaim(expense: any): void {
    Swal.fire({
      title: 'Disburse & Reimburse Expense?',
      html: `
        <div class="text-start fs-7">
          <p class="mb-1"><strong>Employee:</strong> ${expense.staff?.name}</p>
          <p class="mb-1"><strong>Amount:</strong> <span class="text-success fw-bold">₹${expense.amount}</span></p>
          <p class="mb-2"><strong>Purpose:</strong> ${expense.description}</p>
          <label class="form-label mb-1">Select Payment Mode:</label>
          <select id="payout-mode" class="form-select form-select-sm mb-2">
            <option value="UPI">UPI / Instant Pay</option>
            <option value="BANK_TRANSFER" selected>Bank Transfer (NEFT/IMPS)</option>
            <option value="CASH">Cash Voucher</option>
          </select>
          <label class="form-label mb-1">Transaction Ref / UTR:</label>
          <input id="payout-ref" class="form-control form-control-sm" placeholder="UTR or Txn ID (Optional)">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#198754',
      confirmButtonText: 'Disburse Funds',
      preConfirm: () => {
        const modeEl = document.getElementById('payout-mode') as HTMLSelectElement;
        const refEl = document.getElementById('payout-ref') as HTMLInputElement;
        return {
          paymentMode: modeEl?.value || 'BANK_TRANSFER',
          transactionReference: refEl?.value || `REIMB-${Date.now()}`
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.staffOps.reimburseExpense(expense._id, result.value).subscribe({
          next: (res) => {
            Swal.fire({
              title: 'Reimbursed & Deducted!',
              text: `₹${expense.amount} has been disbursed and recorded in Treasury Ledger.`,
              icon: 'success'
            });
            this.loadExpenses();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Payout failed', 'error');
          }
        });
      }
    });
  }
}
