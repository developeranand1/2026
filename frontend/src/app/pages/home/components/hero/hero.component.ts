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
      badgeText: "🇮🇳 भारत का नं. 1 डिजिटल कृषि एवं मंडी मंच",
      titlePrefix: 'सच्ची मेहनत, सही दाम -',
      titleHighlight: 'सीधे खेत से डिजिटल मंडी तक',
      description: 'देशभर के 50,000+ सत्यापित किसान, 50+ एपीएमसी मंडी भाव, ऑनलाइन आवक टोकन व बिना बिचौलियों के 100% पारदर्शी कृषि व्यापार।',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=85',
      altText: 'Indian Farmer in Sunny Wheat Field',
      primaryCtaText: 'लाइव मंडी भाव देखें',
      primaryCtaLink: '/mandi-rates',
      secondaryCtaText: 'नजदीकी खरीद केंद्र',
      secondaryCtaLink: '/our-centers',
      tag: 'India #1 Platform',
      mandiRatePill: 'गेहूँ (Wheat): ₹2,425/qtl ▲ +2.4%',
      mandiIcon: 'bi-flower1'
    },
    {
      id: 2,
      badgeIcon: 'bi-award-fill',
      badgeText: '🏆 100% कम्प्यूटरीकृत तौल व सरकारी MSP खरीद',
      titlePrefix: 'समर्थन मूल्य (MSP) गारंटी,',
      titleHighlight: '24 घंटे में सीधा बैंक DBT',
      description: 'अपने नजदीकी अधिकृत केंद्र पर 4-अंकीय डिजिटल आवक टोकन प्राप्त करें, बिना कतार के सटीक इलेक्ट्रॉनिक तौल करवाएं और पक्की रसीद पाएं।',
      image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=85',
      altText: 'Farmers trading crop produce at Mandi',
      primaryCtaText: 'अधिकृत केंद्र खोजें',
      primaryCtaLink: '/our-centers',
      secondaryCtaText: 'किसान रजिस्ट्रेशन',
      secondaryCtaLink: '/login',
      tag: 'MSP Guarantee',
      mandiRatePill: 'धान / Paddy: ₹2,320/qtl ▲ +1.9%',
      mandiIcon: 'bi-currency-rupee'
    },
    {
      id: 3,
      badgeIcon: 'bi-truck-flatbed',
      badgeText: '⚡ फार्म-गेट डायरेक्ट सप्लाई एवं थोक बाज़ार',
      titlePrefix: 'खेत से सीधे खरीदार तक,',
      titleHighlight: 'ताज़ा उपज, तेज़ सप्लाई',
      description: 'थोक व्यापारी, मिलर्स और उपभोक्ता सीधे किसान से शुद्ध ताज़ा अनाज, दालें, फल व जैविक सब्जियां बिना बिचौलिया कमीशन के प्राप्त करें।',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85',
      altText: 'Fresh vibrant organic harvest produce',
      primaryCtaText: 'थोक फसल बाज़ार',
      primaryCtaLink: '/mandi-rates',
      secondaryCtaText: 'लेवी दरें देखें',
      secondaryCtaLink: '/levy-rates',
      tag: 'Direct Trade',
      mandiRatePill: 'सरसों / Mustard: ₹5,650/qtl ▲ +3.2%',
      mandiIcon: 'bi-box-seam'
    }
  ];

  readonly quickTags = [
    { label: 'गेहूँ (Wheat)', icon: 'bi-flower1', query: 'Wheat' },
    { label: 'धान (Paddy)', icon: 'bi-flower2', query: 'Paddy' },
    { label: 'सरसों (Mustard)', icon: 'bi-tree-fill', query: 'Mustard' },
    { label: 'ताज़ा सब्जियां', icon: 'bi-basket2-fill', query: 'Vegetables' },
    { label: 'हमारे केंद्र', icon: 'bi-geo-alt-fill', query: 'Centers' }
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
    if (tagQuery === 'Centers') {
      this.router.navigate(['/our-centers']);
      return;
    }
    this.router.navigate(['/mandi-rates'], { queryParams: { category: tagQuery } });
  }
}
