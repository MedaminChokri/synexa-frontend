import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './website/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ClientAuthGuard } from './core/guards/client-auth.guard';
import { ServicesDetailComponent } from './website/sections/services-detail/services-detail.component';
import { AgencePageComponent } from './website/agence/agence-page.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ClientLoginComponent } from './auth/login/client-login.component';
import { AboutComponent } from './website/about/about.component';
import { InsightsPageComponent } from './website/insights/insights-page.component';
import { ContactPageComponent } from './website/contact/contact-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'insights', component: InsightsPageComponent },
  { path: 'agence', component: AgencePageComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: 'services/conseil',    component: ServicesDetailComponent, data: { categorie: 'SERVICES' } },
  { path: 'services/tech-ia',    component: ServicesDetailComponent, data: { categorie: 'TECH_IA' } },
  { path: 'services/expertise',  component: ServicesDetailComponent, data: { categorie: 'EXPERTISE' } },
  { path: 'services/formation',  component: ServicesDetailComponent, data: { categorie: 'FORMATION' } },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-email', loadComponent: () => import('./auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: 'login', component: ClientLoginComponent },
  { path: 'client-login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'management', redirectTo: 'login', pathMatch: 'full' },
  { path: 'admin/login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'espace-client', canActivate: [ClientAuthGuard], loadChildren: () => import('./client/client.routes').then(m => m.ESPACE_CLIENT_ROUTES) },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
