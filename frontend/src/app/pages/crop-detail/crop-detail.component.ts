import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MandiRateService } from '../home/mandi-rate.service';
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
            <a href="https://wa.me/91${mobile}?text=Hello,%20I%20am%20interested%20in%20your%20crop%20listing%20${encodeURIComponent(cropName)}%20on%20GaonBazar" target="_blank" class="btn btn-outline-success rounded-pill fw-bold">
              <i class="bi bi-whatsapp me-1"></i> Chat on WhatsApp
            </a>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true
    });
  }
}
