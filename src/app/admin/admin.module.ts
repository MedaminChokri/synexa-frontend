import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';

// Non-standalone components
import { DashboardComponent } from './dashboard/dashboard.component';

// Standalone components (imported, not declared)
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { RendezVousAdminComponent } from './communication/rendezvous/rendezvous-admin.component';
import { UtilisateursAdminComponent } from './rh/utilisateurs/utilisateurs-admin.component';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
    // Standalone components
    DashboardHomeComponent,
    RendezVousAdminComponent,
    UtilisateursAdminComponent,
  ]
})
export class AdminModule {}
