import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MandiRateService } from '../home/mandi-rate.service';
import { SeoService } from '../../core/seo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cropId = params['id'];
      if (this.cropId) {
        this.fetchCropDetails();
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
      title: `${name} (${qty}) - ${price} | KrisiMarg`,
      description: `Buy ${name} from ${this.cropDetails.postedByName || 'Farmer'} in ${loc}. Quantity: ${qty}, Expected Price: ${price}. Verified agricultural listing on KrisiMarg.`,
      keywords: `${name}, ${this.cropDetails.category || ''}, ${loc} mandi, ${name} price today, buy farm produce online, KrisiMarg`,
      image: img || undefined,
      url: `/product/${this.cropId}`,
      type: 'product'
    });

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name,
      "image": img || "https://krisimarg.com/imgs/banner/banner-all.png",
      "description": `Direct farm produce ${name} listed on KrisiMarg from ${loc}`,
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

  contactSeller(): void {
    if (!this.cropDetails || !this.cropDetails.postedByMobile) {
      Swal.fire('Info', 'Contact mobile number not listed.', 'info');
      return;
    }

    const mobile = this.cropDetails.postedByMobile;
    const cropName = this.cropDetails.cropName;

    Swal.fire({
      title: `Contact ${this.cropDetails.postedByName || 'Seller'}`,
      html: `
        <div class="py-2 text-start">
          <p class="mb-2 fs-6">Interested in <strong>${cropName}</strong>?</p>
          <div class="p-3 bg-light rounded-3 border mb-3">
            <span class="fs-8 text-muted d-block">Direct Mobile Line:</span>
            <h4 class="fw-bold text-success mb-0">+91 ${mobile}</h4>
          </div>
          <div class="d-grid gap-2">
            <a href="tel:${mobile}" class="btn btn-success rounded-pill fw-bold">
              <i class="bi bi-telephone-fill me-1"></i> Call Seller Now
            </a>
            <a href="https://wa.me/91${mobile}?text=Hello,%20I%20am%20interested%20in%20your%20crop%20listing%20${encodeURIComponent(cropName)}%20on%20KrisiMarg" target="_blank" class="btn btn-outline-success rounded-pill fw-bold">
              <i class="bi bi-whatsapp me-1"></i> Chat on WhatsApp
            </a>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true
    });
  }

  shareOnWhatsApp(): void {
    if (!this.cropDetails) return;
    const name = this.cropDetails.cropName || 'Crop Produce';
    const loc = this.cropDetails.location || 'India';
    const price = `₹${this.cropDetails.expectedPrice || 0}/${this.cropDetails.priceUnit || 'Quintal'}`;
    const qty = `${this.cropDetails.quantity || ''} ${this.cropDetails.unit || 'Qtl'}`;
    const url = `https://krisimarg.com/product/${this.cropId}`;
    
    const text = `🌾 *${name}* (${qty}) Available for Sale on KrisiMarg!\n💰 *Price:* ${price}\n📍 *Location:* ${loc}\n\n👉 *View Details & Contact Seller:* ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  shareOnSocial(platform: 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy'): void {
    if (!this.cropDetails) return;
    const url = `https://krisimarg.com/product/${this.cropId}`;
    const title = `${this.cropDetails.cropName} on KrisiMarg`;

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
              showConfirmButton: false
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
