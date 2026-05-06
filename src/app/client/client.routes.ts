import { Routes } from '@angular/router';
import { EspaceClientLayoutComponent } from './layout/espace-client-layout.component';
import { EspaceClientComponent } from './dashboard/espace-client.component';

export const ESPACE_CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: EspaceClientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EspaceClientComponent },
      { path: 'notifications', loadComponent: () => import('./notifications/notifications-client.component').then(m => m.NotificationsClientComponent) },
      { path: 'analytics', loadComponent: () => import('./analytics/analytics-client.component').then(m => m.AnalyticsClientComponent) },
      { path: 'missions', loadComponent: () => import('./missions/missions-client.component').then(m => m.MissionsClientComponent) },
      { path: 'contrats', loadComponent: () => import('./contrats/contrats-client.component').then(m => m.ContratsClientComponent) },
      { path: 'documents', loadComponent: () => import('./documents/documents-client.component').then(m => m.DocumentsClientComponent) },
      { path: 'rendez-vous', loadComponent: () => import('./rendez-vous/rendez-vous-client.component').then(m => m.RendezVousClientComponent) },
      { path: 'messages', loadComponent: () => import('./messages/messages-client.component').then(m => m.MessagesClientComponent) },
      { path: 'profil', loadComponent: () => import('./profil/profil-client.component').then(m => m.ProfilClientComponent) },
      { path: 'historique', loadComponent: () => import('./historique/historique-client.component').then(m => m.HistoriqueClientComponent) },
      { path: 'factures', loadComponent: () => import('./factures/factures-client.component').then(m => m.FacturesClientComponent) },
      { path: 'assistant', loadComponent: () => import('./assistant/assistant-client.component').then(m => m.AssistantClientComponent) },
    ]
  }
];
