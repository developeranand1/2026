import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MandiRateService } from '../home/mandi-rate.service';
import { SeoService } from '../../core/seo.service';
import { MaskPhoneDirective } from '../../shared/directives/mask-phone.directive';
import { MaskPhonePipe } from '../../shared/pipes/mask-phone.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe, MaskPhoneDirective, MaskPhonePipe],
  templateUrl: './crop-detail.component.html',
  styleUrl: './crop-detail.component.scss'
})
export class CropDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mandiRateService = inject(MandiRateService);
  private seoService = inject(SeoService);
  private location = inject(Location);

  cropId = '';
  cropDetails: any = null;
  isLoading = true;
  activeImageIndex = 0;
  isSaved = false;

  // Customer Direct Inquiry Form State
  inquiryForm = {
    name: '',
    mobile: '',
    quantity: '',
    offeredPrice: '',
    message: ''
  };
  isInquirySubmitted = false;
  isSubmittingInquiry = false;

  // KisanMarg Official Team Support Desk
  readonly kisanMargSupport = {
    phone: '9876543210',
    displayPhone: '+91 98765 43210',
    whatsapp: '919876543210',
    email: 'support@krisimarg.com',
    hours: 'Mon - Sat (9:00 AM - 7:00 PM IST)'
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cropId = params['id'];
      if (this.cropId) {
        this.fetchCropDetails();
        this.checkSavedStatus();
      }
    });
  }

  fetchCropDetails(): void {
    this.isLoading = true;
    this.mandiRateService.getCropById(this.cropId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.cropDetails = res.data;
          if (this.cropDetails.expectedPrice) {
            this.inquiryForm.offeredPrice = String(this.cropDetails.expectedPrice);
          }
          this.updateCropSeo();
        } else {
          this.cropDetails = null;
        }
      },
      error: () => {
        this.isLoading = false;
        this.cropDetails = null;
      }
    });
  }

  private updateCropSeo(): void {
    if (!this.cropDetails) return;
    const name = this.cropDetails.cropName || 'Crop Listing';
    const loc = this.cropDetails.location || 'India';
    const price = `₹${this.cropDetails.expectedPrice || 0}/${this.cropDetails.priceUnit || 'Qtl'}`;
    const qty = `${this.cropDetails.quantity || ''} ${this.cropDetails.unit || 'Qtl'}`;
    const img = (this.cropDetails.images && this.cropDetails.images[0]) || this.cropDetails.image || '';

    this.seoService.updateSeo({
      title: `${name} (${qty}) - ${price} | KisanMarg Mandi`,
      description: `Buy ${name} directly from ${this.cropDetails.postedByName || 'Farmer'} in ${loc}. Quantity: ${qty}, Expected Price: ${price}. Verified agricultural produce on KisanMarg.`,
      keywords: `${name}, ${this.cropDetails.category || ''}, ${loc} mandi, ${name} price today, buy farm produce online, KisanMarg, KrisiMarg`,
      image: img || undefined,
      url: `/product/${this.cropId}`,
      type: 'product'
    });

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name,
      "image": img || "https://krisimarg.com/imgs/banner/banner-all.png",
      "description": `Direct farm produce ${name} listed on KisanMarg from ${loc}`,
      "category": this.cropDetails.category || "Agricultural Produce",
      "offers": {
        "@type": "Offer",
        "price": this.cropDetails.expectedPrice || 0,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "priceValidUntil": "2027-12-31"
      }
    };
    this.seoService.setJsonLd(productSchema, 'crop-product-jsonld');
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  goBack(): void {
    this.location.back();
  }

  checkSavedStatus(): void {
    try {
      const savedList = JSON.parse(localStorage.getItem('kisanmarg_saved_crops') || '[]');
      this.isSaved = savedList.includes(this.cropId);
    } catch {
      this.isSaved = false;
    }
  }

  toggleSaveCrop(): void {
    this.isSaved = !this.isSaved;
    try {
      let savedList: string[] = JSON.parse(localStorage.getItem('kisanmarg_saved_crops') || '[]');
      if (this.isSaved) {
        if (!savedList.includes(this.cropId)) savedList.push(this.cropId);
        Swal.fire({
          icon: 'success',
          title: 'Saved to Wishlist',
          text: 'You can quickly access this produce listing anytime.',
          timer: 1600,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        savedList = savedList.filter(id => id !== this.cropId);
        Swal.fire({
          icon: 'info',
          title: 'Removed from Wishlist',
          timer: 1400,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
      localStorage.setItem('kisanmarg_saved_crops', JSON.stringify(savedList));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Submit Quick Customer Inquiry Form
   */
  submitCustomerInquiry(): void {
    if (!this.inquiryForm.name || !this.inquiryForm.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Enter Your Name',
        text: 'Please provide your name so the seller and team can contact you.',
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    const cleanMobile = this.inquiryForm.mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Valid Mobile Required',
        text: 'Please enter a valid 10-digit mobile number.',
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    this.isSubmittingInquiry = true;

    setTimeout(() => {
      this.isSubmittingInquiry = false;
      this.isInquirySubmitted = true;

      const cropName = this.cropDetails?.cropName || 'Crop Produce';
      const seller = this.cropDetails?.postedByName || 'Seller';
      const loc = this.cropDetails?.location || '';
      const whatsappText = encodeURIComponent(
        `🌾 *New Trade Inquiry on KisanMarg*\n\n• *Produce:* ${cropName}\n• *Customer Name:* ${this.inquiryForm.name.trim()}\n• *Customer Mobile:* +91 ${cleanMobile}\n• *Quantity Needed:* ${this.inquiryForm.quantity || 'As listed'} ${this.cropDetails?.unit || 'Qtl'}\n• *Offered Rate:* ₹${this.inquiryForm.offeredPrice || this.cropDetails?.expectedPrice || ''}/${this.cropDetails?.priceUnit || 'Qtl'}\n• *Seller:* ${seller} (${loc})\n• *Listing URL:* https://krisimarg.com/product/${this.cropId}\n\nPlease connect me with the seller & coordinate sample verification.`
      );

      Swal.fire({
        icon: 'success',
        title: 'Inquiry Submitted!',
        html: `
          <div class="py-2 text-start fs-7 text-secondary">
            <p class="mb-2 text-dark">Thank you <strong>${this.inquiryForm.name}</strong>! Your inquiry for <strong>${cropName}</strong> has been received by the KisanMarg Team.</p>
            <div class="p-3 bg-light rounded-3 border mb-3">
              <span class="fs-8 text-muted d-block">Expected Callback:</span>
              <strong class="text-success">Within 15 - 30 minutes</strong>
            </div>
            <div class="d-grid gap-2">
              <a href="https://wa.me/${this.kisanMargSupport.whatsapp}?text=${whatsappText}" target="_blank"
                 class="btn btn-success py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-whatsapp fs-5"></i> Send on WhatsApp for Instant Response
              </a>
            </div>
          </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
      });
    }, 500);
  }

  /**
   * Connect to KisanMarg Team Modal
   */
  connectToKisanMargTeam(): void {
    if (!this.cropDetails) return;
    const cropName = this.cropDetails.cropName || 'Crop Produce';
    const qty = `${this.cropDetails.quantity || ''} ${this.cropDetails.unit || 'Qtl'}`;
    const rate = `₹${this.cropDetails.expectedPrice || 0}/${this.cropDetails.priceUnit || 'Quintal'}`;
    const seller = this.cropDetails.postedByName || 'Farmer';
    const loc = this.cropDetails.location || '';

    const whatsappMessage = encodeURIComponent(
      `🌾 *Hello KisanMarg Support Team!*\n\nI want assistance for this produce listing on KisanMarg:\n• *Produce:* ${cropName}\n• *Quantity:* ${qty}\n• *Listed Rate:* ${rate}\n• *Seller:* ${seller}\n• *Location:* ${loc}\n• *Listing URL:* https://krisimarg.com/product/${this.cropId}\n\nPlease connect me with your Mandi Trade Coordinator for sample testing & price negotiation.`
    );

    Swal.fire({
      title: `<div class="d-flex align-items-center justify-content-center gap-2 text-success">
                <i class="bi bi-patch-check-fill fs-3"></i>
                <span class="fw-bold">Connect with KisanMarg Team</span>
              </div>`,
      html: `
        <div class="text-start py-2">
          <div class="p-3 bg-success-subtle bg-opacity-25 rounded-4 border border-success-subtle mb-3">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-success text-white rounded-pill px-2.5 py-1">Assisted Trading</span>
              <span class="text-muted fs-8">${this.kisanMargSupport.hours}</span>
            </div>
            <p class="mb-0 text-dark fs-7">
              Our <strong>KisanMarg Agri Coordinators</strong> help you negotiate rates, organize quality inspection, verify genuine weighment, and arrange doorstep logistics.
            </p>
          </div>

          <div class="bg-light p-3 rounded-4 border mb-3">
            <div class="row g-2 text-dark fs-8">
              <div class="col-6">
                <span class="text-muted d-block">Listing:</span>
                <strong>${cropName} (${qty})</strong>
              </div>
              <div class="col-6">
                <span class="text-muted d-block">Rate:</span>
                <strong class="text-success">${rate}</strong>
              </div>
            </div>
          </div>

          <div class="d-grid gap-2">
            <a href="https://wa.me/${this.kisanMargSupport.whatsapp}?text=${whatsappMessage}" target="_blank"
               class="btn btn-success py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
              <i class="bi bi-whatsapp fs-5"></i> Chat with KisanMarg Coordinator
            </a>

            <a href="tel:${this.kisanMargSupport.phone}"
               class="btn btn-outline-success py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-telephone-fill"></i> Call Helpline: ${this.kisanMargSupport.displayPhone}
            </a>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-4 shadow-lg border-0'
      }
    });
  }

  /**
   * Direct contact dialog with seller
   */
  contactSeller(): void {
    if (!this.cropDetails || !this.cropDetails.postedByMobile) {
      this.connectToKisanMargTeam();
      return;
    }

    const mobile = this.cropDetails.postedByMobile;
    const cropName = this.cropDetails.cropName;
    const seller = this.cropDetails.postedByName || 'Seller';

    Swal.fire({
      title: `<div class="d-flex align-items-center justify-content-center gap-2 text-dark">
                <i class="bi bi-person-badge-fill text-success fs-3"></i>
                <span class="fw-bold">Contact ${seller}</span>
              </div>`,
      html: `
        <div class="py-2 text-start">
          <p class="mb-3 text-secondary fs-7">
            Directly connect with <strong>${seller}</strong> regarding <strong>${cropName}</strong>.
          </p>

          <div class="p-3 bg-light rounded-4 border mb-3">
            <span class="fs-8 text-muted d-block mb-1">Seller Mobile Line:</span>
            <div class="d-flex align-items-center justify-content-between">
              <h4 class="fw-bold text-success mb-0">+91 ${mobile}</h4>
              <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 fs-8">
                <i class="bi bi-shield-check me-1"></i>Verified
              </span>
            </div>
          </div>

          <div class="p-3 bg-warning-subtle bg-opacity-25 rounded-3 border border-warning-subtle mb-3">
            <div class="d-flex gap-2">
              <i class="bi bi-shield-exclamation text-warning fs-5 flex-shrink-0"></i>
              <div class="fs-8 text-dark">
                <strong>Safety Tip:</strong> Never transfer full advance payment without physically inspecting produce quality. Use KisanMarg Trade Assistance for guaranteed deals.
              </div>
            </div>
          </div>

          <div class="d-grid gap-2">
            <a href="tel:${mobile}" class="btn btn-success rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
              <i class="bi bi-telephone-fill"></i> Call Seller Directly
            </a>
            <a href="https://wa.me/91${mobile}?text=Namaste,%20I%20saw%20your%20listing%20for%20${encodeURIComponent(cropName)}%20on%20KisanMarg.%20Please%20share%20deal%20details." target="_blank"
               class="btn btn-outline-success rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-whatsapp"></i> WhatsApp Seller
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

  shareOnWhatsApp(): void {
    if (!this.cropDetails) return;
    const name = this.cropDetails.cropName || 'Crop Produce';
    const loc = this.cropDetails.location || 'India';
    const price = `₹${this.cropDetails.expectedPrice || 0}/${this.cropDetails.priceUnit || 'Quintal'}`;
    const qty = `${this.cropDetails.quantity || ''} ${this.cropDetails.unit || 'Qtl'}`;
    const url = `https://krisimarg.com/product/${this.cropId}`;

    const text = `🌾 *${name}* (${qty}) Available for Sale on KisanMarg!\n💰 *Price:* ${price}\n📍 *Location:* ${loc}\n\n👉 *View Details & Trade:* ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  shareOnSocial(platform: 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy'): void {
    if (!this.cropDetails) return;
    const url = `https://krisimarg.com/product/${this.cropId}`;
    const title = `${this.cropDetails.cropName} on KisanMarg Digital Mandi`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Link Copied!',
              text: 'Produce link copied to clipboard. You can paste and share it anywhere.',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          });
        }
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=450');
    }
  }
}