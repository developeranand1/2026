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

// Route configuration for KrisiMarg application
export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'KrisiMarg | किसान से सीधे खरीदें'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login & Register | KrisiMarg'
    },
    {
        path: 'news',
        component: NewsListComponent,
        title: 'News & Agri Market Updates | KrisiMarg'
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
        path: 'farmer',
        component: FarmerSidebarComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: FarmerDashboardComponent, title: 'Farmer Dashboard | KrisiMarg' },
            { path: 'product', component: FarmerProductComponent, title: 'My Crop Produce | KrisiMarg' },
            { path: 'product/:id', component: CropDetailComponent, title: 'Crop Produce Specifications | KrisiMarg' },
            { path: 'profile', component: FarmerProfileComponent, title: 'Farmer Profile | KrisiMarg' },
            { path: 'mandi-rates', component: FarmerMindiRateComponent, title: 'Live Mandi Rates | KrisiMarg' }
        ]
    },
    {
        path: 'buyer',
        component: BuyerSidebarComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: BuyerDashboardComponent, title: 'Buyer Marketplace Dashboard | KrisiMarg' },
            { path: 'product', component: BuyerProductComponent, title: 'My Purchasing Requirements | KrisiMarg' },
            { path: 'product/:id', component: CropDetailComponent, title: 'Purchasing Requirement Specifications | KrisiMarg' },
            { path: 'profile', component: BuyerProfileComponent, title: 'Buyer Business Profile | KrisiMarg' }
        ]
    },

    {
        path: 'about',
        component: AboutComponent,
        title: 'About Us | KrisiMarg'
    },
    {
        path: 'contact',
        component: ContactComponent,
        title: 'Contact Us | KrisiMarg'
    },
    {
        path: 'faq',
        component: FaqComponent,
        title: 'Frequently Asked Questions | KrisiMarg'
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        title: 'Privacy Policy | KrisiMarg'
    },
    {
        path: 'terms',
        component: TermsComponent,
        title: 'Terms and Conditions | KrisiMarg'
    },
    {
        path: 'refund-policy',
        component: RefundPolicyComponent,
        title: 'Refund Policy | KrisiMarg'
    },
    {
        path: 'disclaimer',
        component: DisclaimerComponent,
        title: 'Disclaimer Policy | KrisiMarg'
    },
    {
        path: 'mandi-rates',
        component: MandiRatesPageComponent,
        title: 'Live Mandi Rates & Crop Bhav | KrisiMarg'
    },

    {
        path: '**',
        redirectTo: ''
    }
];
