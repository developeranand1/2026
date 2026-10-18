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
import { CenterManagementComponent } from './admin/centers/center-management.component';
import { CenterDetailComponent } from './admin/centers/center-detail/center-detail.component';
import { CenterFormComponent } from './admin/centers/center-form/center-form.component';
import { FundsManagementComponent } from './admin/funds/funds-management.component';
import { StaffManagementComponent } from './admin/staff/staff-management.component';
import { FieldWorkManagementComponent } from './admin/field-work/field-work-management.component';
import { ExpenseManagementComponent } from './admin/expenses/expense-management.component';

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
      },
      {
        path: 'centers',
        component: CenterManagementComponent
      },
      {
        path: 'centers/create',
        component: CenterFormComponent
      },
      {
        path: 'centers/edit/:id',
        component: CenterFormComponent
      },
      {
        path: 'centers/:id',
        component: CenterDetailComponent
      },
      {
        path: 'funds',
        component: FundsManagementComponent
      },
      {
        path: 'staff',
        component: StaffManagementComponent
      },
      {
        path: 'field-work',
        component: FieldWorkManagementComponent
      },
      {
        path: 'expenses',
        component: ExpenseManagementComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'admin/login'
  }
];
