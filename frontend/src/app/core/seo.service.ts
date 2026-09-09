import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  robots?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private readonly DEFAULT_TITLE = 'KrisiMarg - भारत का डिजिटल कृषि बाज़ार | Mandi Bhav & Direct Farm Produce';
  private readonly DEFAULT_DESCRIPTION = 'KrisiMarg भारत का अग्रणी डिजिटल कृषि मंच है। लाइव मंडी भाव (APMC Mandi Rates), फसल खरीद-बिक्री (Direct Farm Gate Procurement), कृषि मौसम पूर्वानुमान और ताज़ा समाचार की सम्पूर्ण जानकारी प्राप्त करें।';
  private readonly DEFAULT_KEYWORDS = 'KrisiMarg, Krishi Marg, Mandi Bhav, APMC Mandi Rates, Kisan Marketplace, Gehu Bhav, Chana Rate, Soybean Price, Direct Farm Produce, Agriculture News India, Mausam Forecast, Barish Alert, किसान बाज़ार, मंडी भाव';
  private readonly DEFAULT_IMAGE = 'https://krisimarg.com/imgs/banner/banner-all.png';
  private readonly BASE_URL = 'https://krisimarg.com';
  private readonly SITE_NAME = 'KrisiMarg';

  /**
   * Initializes automatic route change listener for SPA SEO
   */
  initRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }

        const data = route.snapshot.data;
        const currentUrl = this.router.url.split('?')[0];

        if (data && data['seo']) {
          this.updateSeo({
            ...data['seo'],
            url: currentUrl
          });
        } else if (!currentUrl.includes('/news/') && !currentUrl.includes('/product/')) {
          // If no specific SEO data is found on route and not a dynamic detail page, apply default/fallback
          const title = route.snapshot.title;
          if (title) {
            this.updateSeo({
              title: title.includes('KrisiMarg') ? title : `${title} | KrisiMarg`,
              url: currentUrl
            });
          }
        }
      });
  }

  /**
   * Updates page title, meta description, keywords, Open Graph, and Twitter card tags
   */
  updateSeo(config: SeoConfig = {}): void {
    const title = config.title ? (config.title.includes('KrisiMarg') ? config.title : `${config.title} | ${this.SITE_NAME}`) : this.DEFAULT_TITLE;
    const description = config.description || this.DEFAULT_DESCRIPTION;
    const keywords = config.keywords || this.DEFAULT_KEYWORDS;
    const image = config.image || this.DEFAULT_IMAGE;
    const url = config.url ? (config.url.startsWith('http') ? config.url : `${this.BASE_URL}${config.url}`) : this.BASE_URL;
    const type = config.type || 'website';
    const author = config.author || 'KrisiMarg Technologies';
    const robots = config.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    // 1. Title Tag
    this.titleService.setTitle(title);

    // 2. Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'author', content: author });
    this.metaService.updateTag({ name: 'robots', content: robots });

    // 3. Open Graph (OG) / Facebook / WhatsApp Card Tags
    this.metaService.updateTag({ property: 'og:site_name', content: this.SITE_NAME });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:image:secure_url', content: image });
    this.metaService.updateTag({ property: 'og:image:alt', content: title });
    this.metaService.updateTag({ property: 'og:locale', content: 'hi_IN' });
    this.metaService.updateTag({ property: 'og:locale:alternate', content: 'en_IN' });

    // 4. Twitter / X Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:site', content: '@KrisiMarg' });
    this.metaService.updateTag({ name: 'twitter:creator', content: '@KrisiMarg' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
    this.metaService.updateTag({ name: 'twitter:image:alt', content: title });

    // 5. Article specifics if applicable
    if (type === 'article' && config.publishedTime) {
      this.metaService.updateTag({ property: 'article:published_time', content: config.publishedTime });
      this.metaService.updateTag({ property: 'article:author', content: author });
    }

    // 6. Canonical Link
    this.updateCanonicalUrl(url);
  }

  /**
   * Dynamically sets or replaces JSON-LD Structured Data script in document head
   */
  setJsonLd(schema: object, schemaId = 'dynamic-jsonld'): void {
    try {
      let script = this.document.getElementById(schemaId) as HTMLScriptElement | null;
      if (!script) {
        script = this.document.createElement('script');
        script.id = schemaId;
        script.type = 'application/ld+json';
        this.document.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    } catch {
      // In SSR or non-browser environment
    }
  }

  /**
   * Resets SEO tags back to KrisiMarg Homepage defaults
   */
  resetToDefault(): void {
    this.updateSeo({});
  }

  /**
   * Dynamically updates or creates canonical link element
   */
  private updateCanonicalUrl(url: string): void {
    try {
      let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    } catch {
      // In SSR or non-browser environment
    }
  }
}
