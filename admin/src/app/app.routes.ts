import { Routes } from '@angular/router';
import { AdminGuard } from './core/admin.guard';
import { AdminLoginComponent } from './admin/login/admin-login.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { CategoryManagementComponent } from './admin/categories/category-management.component';
import { CropManagementComponent } from './admin/crops/crop-management.component';
import { UserManagementComponent } from './admin/users/user-management.component';
import { ContactManagementComponent } from './admin/contact/contact-management.component';
import { NewsManagementComponent } from './admin/news/news-management.component';
import { TrainingManagementComponent } from './admin/trainings/training-management.component';
import { LevyRateManagementComponent } from './admin/levy-rates/levy-rate-management.component';
import { PaymentManagementComponent } from './admin/payments/payment-management.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'categories',
        component: CategoryManagementComponent
      },
      {
        path: 'crops',
        component: CropManagementComponent
      },
      {
        path: 'crops/create',
        component: CropManagementComponent
      },
      {
        path: 'crops/edit/:id',
        component: CropManagementComponent
      },
      {
        path: 'trainings',
        component: TrainingManagementComponent
      },
      {
        path: 'trainings/create',
        component: TrainingManagementComponent
      },
      {
        path: 'trainings/edit/:id',
        component: TrainingManagementComponent
      },
      {
        path: 'trainings/view/:id',
        component: TrainingManagementComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'users/view/:id',
        component: UserManagementComponent
      },
      {
        path: 'contact',
        component: ContactManagementComponent
      },
      {
        path: 'news',
        component: NewsManagementComponent
      },
      {
        path: 'news/create',
        component: NewsManagementComponent
      },
      {
        path: 'news/edit/:id',
        component: NewsManagementComponent
      },
      {
        path: 'mandi-rates',
        component: AdminDashboardComponent
      },
      {
        path: 'levy-rates',
        component: LevyRateManagementComponent
      },
      {
        path: 'payments',
        component: PaymentManagementComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'admin/login'
  }
];
