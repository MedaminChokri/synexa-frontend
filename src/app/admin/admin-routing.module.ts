import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { RendezVousAdminComponent } from './communication/rendezvous/rendezvous-admin.component';
import { UtilisateursAdminComponent } from './rh/utilisateurs/utilisateurs-admin.component';
import { RoleGuard } from '../core/guards/role.guard';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'rendezvous', component: RendezVousAdminComponent },
      { path: 'utilisateurs', component: UtilisateursAdminComponent },
      {
        path: 'ressources-humaines',
        loadComponent: () => import('./rh/ressources-humaines/ressources-humaines.component').then(m => m.RessourcesHumainesComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { path: 'journal-activite', loadComponent: () => import('./administration/journal-activite/journal-activite.component').then(m => m.JournalActiviteComponent) },
      { path: 'messages-clients', loadComponent: () => import('./communication/messages/messages-admin.component').then(m => m.MessagesAdminComponent) },
      { path: 'missions-clients', loadComponent: () => import('./clients/missions/missions-admin.component').then(m => m.MissionsAdminComponent) },
      { path: 'factures-clients', loadComponent: () => import('./clients/factures/factures-admin.component').then(m => m.FacturesAdminComponent) },
      { path: 'fiche-client/:id', loadComponent: () => import('./clients/fiche-client/fiche-client-admin.component').then(m => m.FicheClientAdminComponent) },
      // Routes CRM — lazy loaded (standalone components)
      { path: 'crm/dashboard', loadComponent: () => import('./crm/dashboard/crm-dashboard.component').then(m => m.CrmDashboardComponent) },
      { path: 'crm/clients', loadComponent: () => import('./crm/clients/crm-clients.component').then(m => m.CrmClientsComponent) },
      { path: 'crm/leads', loadComponent: () => import('./crm/leads/crm-leads.component').then(m => m.CrmLeadsComponent) },
      { path: 'crm/leads/:id', loadComponent: () => import('./crm/lead-detail/crm-lead-detail.component').then(m => m.CrmLeadDetailComponent) },
      { path: 'crm/agenda', loadComponent: () => import('./crm/agenda/crm-agenda.component').then(m => m.CrmAgendaComponent) },
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
