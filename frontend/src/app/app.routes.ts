import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FaqComponent } from './pages/faq/faq.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy.component';


import { FarmerSidebarComponent } from './farmer/farmer-sidebar/farmer-sidebar.component';
import { FarmerDashboardComponent } from './farmer/farmer-dashboard/farmer-dashboard.component';
import { FarmerProfileComponent } from './farmer/farmer-profile/farmer-profile.component';
import { FarmerMindiRateComponent } from './farmer/farmer-mindi-rate/farmer-mindi-rate.component';
import { BuyerSidebarComponent } from './buyer/buyer-sidebar/buyer-sidebar.component';
import { BuyerDashboardComponent } from './buyer/buyer-dashboard/buyer-dashboard.component';
import { BuyerProfileComponent } from './buyer/buyer-profile/buyer-profile.component';
import { LoginComponent } from './auth/login/login.component';

// Route configuration for GaonBazar application
export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'GaonBazar | किसान से सीधे खरीदें'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login & Register | GaonBazar'
    },


    {
        path: 'farmer',
        component: FarmerSidebarComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: FarmerDashboardComponent, title: 'Farmer Dashboard | GaonBazar' },
            { path: 'profile', component: FarmerProfileComponent, title: 'Farmer Profile | GaonBazar' },
            { path: 'mandi-rates', component: FarmerMindiRateComponent, title: 'Live Mandi Rates | GaonBazar' }
        ]
    },
    {
        path: 'buyer',
        component: BuyerSidebarComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: BuyerDashboardComponent, title: 'Buyer Marketplace Dashboard | GaonBazar' },
            { path: 'profile', component: BuyerProfileComponent, title: 'Buyer Business Profile | GaonBazar' }
        ]
    },


    {
        path: 'about',
        component: AboutComponent,
        title: 'About Us | GaonBazar'
    },

    {
        path: 'contact',
        component: ContactComponent,
        title: 'Contact Us | GaonBazar'
    },

    {
        path: 'faq',
        component: FaqComponent,
        title: 'Frequently Asked Questions | GaonBazar'
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        title: 'Privacy Policy | GaonBazar'
    },
    {
        path: 'terms',
        component: TermsComponent,
        title: 'Terms and Conditions | GaonBazar'
    },
    {
        path: 'refund-policy',
        component: RefundPolicyComponent,
        title: 'Refund Policy | GaonBazar'
    },

    {
        path: '**',
        redirectTo: ''
    }
];
