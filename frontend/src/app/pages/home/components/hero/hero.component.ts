import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

export interface HeroSlide {
  id: number;
  badgeIcon: string;
  badgeText: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  image: string;
  altText: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  tag: string;
  mandiRatePill: string;
  mandiIcon: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  activeSlideIndex = 0;
  private autoPlayInterval: any;

  readonly slides: HeroSlide[] = [
    {
      id: 1,
      badgeIcon: 'bi-patch-check-fill',
      badgeText: "India's #1 Digital Agriculture Marketplace",
      titlePrefix: 'Farm-Fresh Produce,',
      titleHighlight: 'Direct from Local Farmers',
      description: 'Connect directly with verified local farmers. Buy organic vegetables, fresh fruits, premium grains & pulses with 100% price transparency.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      altText: 'Fresh organic farm vegetables',
      primaryCtaText: 'Shop Fresh Produce',
      primaryCtaLink: '/mandi-rates',
      secondaryCtaText: 'Join as Farmer',
      secondaryCtaLink: '/farmer/dashboard',
      tag: 'Fresh Harvest',
      mandiRatePill: 'Wheat Mandi: ₹2,275/qtl ▲ +2.4%',
      mandiIcon: 'bi-flower1'
    },
    {
      id: 2,
      badgeIcon: 'bi-graph-up-arrow',
      badgeText: 'Live Mandi Price Transparency',
      titlePrefix: 'Real-Time APMC Mandi Rates,',
      titleHighlight: 'Fair Price Guarantee',
      description: 'Empowering farmers & commercial buyers with live APMC mandi rates across 50+ hubs. Trade directly with zero middlemen exploitation.',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
      altText: 'Indian Farmer in Wheat Field',
      primaryCtaText: 'Check Live Mandi Rates',
      primaryCtaLink: '/farmer/mandi-rates',
      secondaryCtaText: 'Seller Registration',
      secondaryCtaLink: '/login',
      tag: 'Live Rates',
      mandiRatePill: 'Onion Mandi: ₹1,850/qtl ▲ +1.8%',
      mandiIcon: 'bi-currency-rupee'
    },
    {
      id: 3,
      badgeIcon: 'bi-truck-flatbed',
      badgeText: 'Fast Nationwide Cold Logistics',
      titlePrefix: 'Harvested Today,',
      titleHighlight: 'Delivered Tomorrow',
      description: 'Temperature-controlled express supply chain connecting rural farm gates directly to wholesale buyers, restaurants, and homes.',
      image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80',
      altText: 'Fresh harvested vegetables basket',
      primaryCtaText: 'Explore Wholesale Deals',
      primaryCtaLink: '/mandi-rates',
      secondaryCtaText: 'Track Delivery',
      secondaryCtaLink: '/faq',
      tag: 'Fast Logistics',
      mandiRatePill: 'Potato Mandi: ₹1,420/qtl ▼ -0.5%',
      mandiIcon: 'bi-box-seam'
    }
  ];

  readonly quickTags = [
    { label: 'Fresh Vegetables', icon: 'bi-basket2-fill', query: 'Vegetables' },
    { label: 'Fresh Fruits', icon: 'bi-flower2', query: 'Fruits' },
    { label: 'Grains & Pulses', icon: 'bi-flower1', query: 'Grains' },
    { label: 'Organic Seeds', icon: 'bi-tree-fill', query: 'Seeds' }
  ];

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5500);
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  setSlide(index: number): void {
    this.activeSlideIndex = index;
    this.startAutoPlay();
  }

  nextSlide(): void {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.activeSlideIndex =
      (this.activeSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.startAutoPlay();
  }

  searchProduct(query: string): void {
    const term = query.trim();
    if (!term) return;
    this.router.navigate(['/mandi-rates'], { queryParams: { search: term } });
  }

  applyTag(tagQuery: string): void {
    this.router.navigate(['/mandi-rates'], { queryParams: { category: tagQuery } });
  }
}
