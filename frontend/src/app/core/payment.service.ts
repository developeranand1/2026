import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RazorpayOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    [key: string]: any;
  };
  keyId: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId?: string;
  mobile?: string;
  name?: string;
  cropData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  private get paymentUrl(): string {
    return `${environment.apiUrl}/payment`;
  }

  /**
   * Dynamically loads Razorpay checkout script if not already present
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const win = window as any;
      if (win.Razorpay) {
        resolve(true);
        return;
      }

      // Check if tag already exists in DOM
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        // Fallback polling for already cached scripts
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (win.Razorpay) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 20) {
            clearInterval(interval);
            resolve(false);
          }
        }, 150);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  /**
   * Get public Razorpay Key ID
   */
  getRazorpayKey(): Observable<{ success: boolean; keyId: string }> {
    return this.http.get<{ success: boolean; keyId: string }>(`${this.paymentUrl}/key`);
  }

  /**
   * Check if Farmer has active unlimited listing access
   */
  checkListingStatus(userId?: string, mobile?: string): Observable<{ success: boolean; hasPaidListingFee: boolean; user?: any }> {
    const params: string[] = [];
    if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
    if (mobile) params.push(`mobile=${encodeURIComponent(mobile)}`);
    const q = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<{ success: boolean; hasPaidListingFee: boolean; user?: any }>(`${this.paymentUrl}/listing-status${q}`);
  }

  /**
   * Create Razorpay Order for ₹99 Listing Fee
   */
  createListingOrder(cropName?: string, farmerName?: string, farmerMobile?: string): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(`${this.paymentUrl}/create-order`, {
      amount: 99,
      cropName: cropName || 'Unlimited Produce Listing Activation',
      farmerName,
      farmerMobile
    });
  }

  /**
   * Activate Unlimited Product Listing for farmer after ₹99 payment
   */
  activateUnlimitedListing(payload: PaymentVerificationPayload): Observable<any> {
    return this.http.post<any>(`${this.paymentUrl}/activate-unlimited-listing`, payload);
  }

  /**
   * Verify signature and persist per-crop listing
   */
  verifyListingPayment(payload: PaymentVerificationPayload): Observable<any> {
    return this.http.post<any>(`${this.paymentUrl}/verify-listing-payment`, payload);
  }

  /**
   * Open the Razorpay Checkout popup modal with automatic script loading
   */
  async openRazorpayCheckout(
    order: any,
    keyId: string,
    farmerUser: any,
    title: string = 'Unlimited Produce Listing Access'
  ): Promise<{ razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }> {
    // 1. Ensure Razorpay SDK is loaded
    const isLoaded = await this.loadRazorpayScript();
    const win = window as any;

    if (!isLoaded || !win.Razorpay) {
      // Small delay in case of network throttle
      await new Promise((r) => setTimeout(r, 600));
    }

    if (!win.Razorpay) {
      throw new Error('Razorpay SDK load nahi ho paya. Kripya internet connection check karke page refresh karein.');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: keyId || environment.razorpayKeyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'KrisiMarg Marketplace',
        description: `One-Time Seller Activation Fee (₹99) - ${title}`,
        image: 'https://krisimarg.com/imgs/logo/logo.png',
        order_id: order.id,
        prefill: {
          name: farmerUser?.name || '',
          contact: farmerUser?.mobile || '',
          email: farmerUser?.email || ''
        },
        theme: {
          color: '#198754'
        },
        modal: {
          ondismiss: () => {
            reject(new Error('PAYMENT_DISMISSED'));
          }
        },
        handler: (response: any) => {
          if (response.razorpay_payment_id && response.razorpay_signature) {
            resolve(response);
          } else {
            reject(new Error('Payment response incomplete'));
          }
        }
      };

      const rzp = new win.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        reject(new Error(resp?.error?.description || 'Payment Failed'));
      });
      rzp.open();
    });
  }
}
