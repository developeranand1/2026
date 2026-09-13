import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FaqComponent } from './pages/faq/faq.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy.component';
import { DisclaimerComponent } from './pages/disclaimer/disclaimer.component';
import { MandiRatesPageComponent } from './pages/mandi-rates/mandi-rates.component';
import { WeatherPageComponent } from './pages/weather/weather.component';
import { CropDetailComponent } from './pages/crop-detail/crop-detail.component';

import { FarmerSidebarComponent } from './farmer/farmer-sidebar/farmer-sidebar.component';
import { FarmerDashboardComponent } from './farmer/farmer-dashboard/farmer-dashboard.component';
import { FarmerProductComponent } from './farmer/farmer-product/farmer-product.component';
import { FarmerProfileComponent } from './farmer/farmer-profile/farmer-profile.component';
import { FarmerMindiRateComponent } from './farmer/farmer-mindi-rate/farmer-mindi-rate.component';

import { BuyerSidebarComponent } from './buyer/buyer-sidebar/buyer-sidebar.component';
import { BuyerDashboardComponent } from './buyer/buyer-dashboard/buyer-dashboard.component';
import { BuyerProductComponent } from './buyer/buyer-product/buyer-product.component';
import { BuyerProfileComponent } from './buyer/buyer-profile/buyer-profile.component';

import { LoginComponent } from './auth/login/login.component';
import { NewsListComponent } from './pages/news/news-list.component';
import { NewsDetailComponent } from './pages/news/news-detail.component';
import { TeamComponent } from './pages/team/team.component';
import { AgriCalculatorComponent } from './pages/agri-calculator/agri-calculator.component';

// Route configuration with comprehensive SEO Meta data for KrisiMarg application
export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'KrisiMarg - भारत का डिजिटल कृषि बाज़ार | Mandi Bhav & Direct Farm Produce',
        data: {
            seo: {
                title: 'KrisiMarg - भारत का डिजिटल कृषि बाज़ार | Mandi Bhav & Direct Farm Produce',
                description: 'KrisiMarg भारत का अग्रणी डिजिटल कृषि मंच है। लाइव मंडी भाव (APMC Mandi Rates), फसल खरीद-बिक्री (Direct Farm Gate Procurement), कृषि मौसम और ताज़ा समाचार पाएं।',
                keywords: 'KrisiMarg, Mandi Bhav, APMC Mandi Rates, Kisan Marketplace, Gehu Bhav, Chana Rate, Soybean Price, Direct Farm Produce, Agriculture News India, Mausam Forecast, Barish Alert'
            }
        }
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login & Register | KrisiMarg',
        data: {
            seo: {
                title: 'Login & Register | Farmer & Buyer Portal | KrisiMarg',
                description: 'किसान और खरीदार लॉगिन करें। अपनी फसलें सीधे बेचें या थोक में कृषि उपज खरीदें।',
                keywords: 'KrisiMarg Login, Farmer Registration, Buyer Portal, Krishi Marketplace Login'
            }
        }
    },
    {
        path: 'news',
        component: NewsListComponent,
        title: 'News & Agri Market Updates | KrisiMarg',
        data: {
            seo: {
                title: 'कृषि समाचार व मंडी अपडेट (Agriculture News & Market Updates) | KrisiMarg',
                description: 'कृषि जगत की ताज़ा खबरें, सरकारी योजनाएं, मंडी भाव विश्लेषण, मौसम रिपोर्ट एवं उन्नत खेती के टिप्स पढ़ें।',
                keywords: 'Krishi Samachar, Agri News India, Mandi News, Farming Updates, Kisan Yojana, KrisiMarg News'
            }
        }
    },
    {
        path: 'news/:slug',
        component: NewsDetailComponent
    },

    {
        path: 'product/:id',
        component: CropDetailComponent,
        title: 'Crop Specifications | KrisiMarg'
    },

    {
        path: 'weather',
        component: WeatherPageComponent,
        title: 'Live Mausam & Barish Forecast | KrisiMarg',
        data: {
            seo: {
                title: 'लाइव कृषि मौसम व बारिश अलर्ट (Krishi Mausam Forecast) | KrisiMarg',
                description: 'सटीक 7-दिवसीय मौसम पूर्वानुमान, प्रति घंटा बारिश अलर्ट, तापमान, आर्द्रता और कृषि सलाह (Crop Weather Advisory)।',
                keywords: 'Krishi Mausam, Aaj Ka Mausam, Rain Alert, Weather Forecast India, Barish Update, Kheti Mausam, KrisiMarg Weather'
            }
        }
    },

    {
        path: 'farmer',
        component: FarmerSidebarComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: FarmerDashboardComponent, title: 'Farmer Dashboard | KrisiMarg', data: { seo: { robots: 'noindex, nofollow' } } },
            { path: 'product', component: FarmerProductComponent, title: 'My Crop Produce | KrisiMarg', data: { seo: { robots: 'noindex, nofollow' } } },
            { path: 'product/:id', component: CropDetailComponent, title: 'Crop Produce Specifications | KrisiMarg' },
            { path: 'profile', component: FarmerProfileComponent, title: 'Farmer Profile | KrisiMarg', data: { seo: { robots: 'noindex, nofollow' } } },
            { path: 'mandi-rates', component: FarmerMindiRateComponent, title: 'Live Mandi Rates | KrisiMarg' },
            { path: 'weather', component: WeatherPageComponent, title: 'Krishi Mausam & Rain Forecast | KrisiMarg' }
        ]
    },
    {
        path: 'buyer',
        component: BuyerSidebarComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: BuyerDashboardComponent, title: 'Buyer Marketplace Dashboard | KrisiMarg', data: { seo: { robots: 'noindex, nofollow' } } },
            { path: 'product', component: BuyerProductComponent, title: 'My Purchasing Requirements | KrisiMarg', data: { seo: { robots: 'noindex, nofollow' } } },
            { path: 'product/:id', component: CropDetailComponent, title: 'Purchasing Requirement Specifications | KrisiMarg' },
            { path: 'profile', component: BuyerProfileComponent, title: 'Buyer Business Profile | KrisiMarg', data: { seo: { robots: 'noindex, nofollow' } } }
        ]
    },

    {
        path: 'about',
        component: AboutComponent,
        title: 'About Us | KrisiMarg',
        data: {
            seo: {
                title: 'About Us | Empowering Indian Agriculture | KrisiMarg',
                description: 'KrisiMarg is a leading digital agriculture marketplace connecting millions of Indian farmers with verified buyers for transparent price discovery.',
                keywords: 'About KrisiMarg, Digital Agriculture, Agri Tech India, Farmer Empowerment, Farm Gate Procurement'
            }
        }
    },
    {
        path: 'team',
        component: TeamComponent,
        title: 'Our Leadership & Team | KrisiMarg',
        data: {
            seo: {
                title: 'Our Leadership & Team | KrisiMarg Management',
                description: 'Meet the visionary founder and executive management team steering KrisiMarg towards digital farming revolution in India.',
                keywords: 'KrisiMarg Leadership, Rajesh Kumar Chaudhary, Atul Kumar, KrisiMarg Founders'
            }
        }
    },
    {
        path: 'contact',
        component: ContactComponent,
        title: 'Contact Us | KrisiMarg',
        data: {
            seo: {
                title: 'Contact Support & Inquiries | KrisiMarg',
                description: 'Get in touch with KrisiMarg support team for marketplace assistance, farmer onboardings, and institutional bulk buying inquiries.',
                keywords: 'Contact KrisiMarg, Agri Support Helpline, Kisan Help Desk, Khalilabad UP'
            }
        }
    },
    {
        path: 'faq',
        component: FaqComponent,
        title: 'Frequently Asked Questions | KrisiMarg',
        data: {
            seo: {
                title: 'Frequently Asked Questions (FAQ) | KrisiMarg Marketplace',
                description: 'Find answers to common questions about buying, selling, live mandi rates, escrow payment security, and transport on KrisiMarg.',
                keywords: 'KrisiMarg FAQ, Mandi Rates FAQ, How to sell crops, Farmer Help, Buyer Help'
            }
        }
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        title: 'Privacy Policy | KrisiMarg',
        data: {
            seo: {
                title: 'Privacy Policy | KrisiMarg',
                description: 'Read the KrisiMarg Privacy Policy to understand how we protect and handle your personal and financial information.',
                keywords: 'Privacy Policy, Data Protection, KrisiMarg Terms'
            }
        }
    },
    {
        path: 'terms',
        component: TermsComponent,
        title: 'Terms and Conditions | KrisiMarg',
        data: {
            seo: {
                title: 'Terms & Conditions | KrisiMarg',
                description: 'Official Terms of Service and User Agreement for farmers, buyers, and visitors using KrisiMarg marketplace.',
                keywords: 'Terms of Service, User Agreement, KrisiMarg Legal'
            }
        }
    },
    {
        path: 'refund-policy',
        component: RefundPolicyComponent,
        title: 'Refund Policy | KrisiMarg',
        data: {
            seo: {
                title: 'Return & Refund Policy | KrisiMarg',
                description: 'Guidelines for order cancellations, produce returns, damaged goods dispute resolution, and payment refunds on KrisiMarg.',
                keywords: 'Refund Policy, Produce Return, Escrow Protection, KrisiMarg'
            }
        }
    },
    {
        path: 'disclaimer',
        component: DisclaimerComponent,
        title: 'Disclaimer Policy | KrisiMarg',
        data: {
            seo: {
                title: 'Disclaimer Policy | KrisiMarg',
                description: 'Official disclaimer regarding APMC mandi rate market variations, third-party logistics, and platform usage on KrisiMarg.',
                keywords: 'Disclaimer, APMC Rates Disclaimer, KrisiMarg Legal'
            }
        }
    },
    {
        path: 'mandi-rates',
        component: MandiRatesPageComponent,
        title: 'Live Mandi Rates & Crop Bhav | KrisiMarg',
        data: {
            seo: {
                title: 'लाइव मंडी भाव (Live Mandi Rates Today) | APMC Market Prices | KrisiMarg',
                description: 'भारत के सभी राज्यों और APMC मंडियों के आज के ताज़ा भाव देखें। गेहूं, धान, सरसों, चना, प्याज, आलू, फल और सब्जियों के दैनिक मंडी भाव।',
                keywords: 'Mandi Rates Today, Mandi Bhav, APMC Live Price, Gehu Mandi Bhav, Dhan Rate, Sarso Bhav, Chana Mandi, All India Mandi Bhav, KrisiMarg'
            }
        }
    },
    {
        path: 'agri-calculator',
        component: AgriCalculatorComponent,
        title: 'Agri Financial Calculator | KCC Loan, Solar Pump Subsidy & Crop Profit | KrisiMarg',
        data: {
            seo: {
                title: 'किसान ऋण व KCC ईएमआई कैलकुलेटर (Agri Financial Calculator) | KrisiMarg',
                description: 'KCC फसल ऋण EMI, 3% सरकारी ब्याज छूट, PM-KUSUM 60% सोलर पंप सब्सिडी और फसल उपज व शुद्ध मुनाफे (Crop ROI) की सटीक गणना करें।',
                keywords: 'Agri Financial Calculator, Kisan Loan Calculator, KCC EMI Calculator, PM Kusum Solar Pump Subsidy, Crop Profit Calculator, Fasal Labh Calculator, Tractor Loan EMI, Kisan Credit Card Scheme, Agriculture Loan Interest Subvention, Krishi Marg'
            }
        }
    },
    {
        path: 'loan-calculator',
        redirectTo: 'agri-calculator',
        pathMatch: 'full'
    },

    {
        path: '**',
        redirectTo: ''
    }
];
