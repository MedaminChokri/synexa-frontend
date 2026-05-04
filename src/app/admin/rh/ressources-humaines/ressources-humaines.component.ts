import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { AdminService } from '../../../core/services/admin.service';
import { Utilisateur } from '../../../models/utilisateur.model';

@Component({
  selector: 'app-ressources-humaines',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ressources-humaines.component.html',
  styleUrls: ['./ressources-humaines.component.css']
})
export class RessourcesHumainesComponent implements OnInit {

  activeTab: 'utilisateurs' = 'utilisateurs';

  // --- Utilisateurs ---
  utilisateurs: Utilisateur[] = [];
  userLoading = false;
  showUserModal = false;
  editingUserId: number | null = null;
  userForm: FormGroup;

  successMsg = '';
  errorMsg = '';

  get isSuperAdmin(): boolean {
    return this.adminService.isSuperAdmin();
  }

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    public adminService: AdminService
  ) {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: [''],
      role: ['CONSULTANT', Validators.required],
      actif: [true]
    });
  }

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.loadUtilisateurs();
    }
  }

  loadUtilisateurs(): void {
    this.userLoading = true;
    this.utilisateurService.getAll().subscribe({
      next: (res: any) => {
        if (res.success) this.utilisateurs = res.data || [];
        this.userLoading = false;
      },
      error: () => { this.showError('Erreur chargement utilisateurs'); this.userLoading = false; }
    });
  }

  openAddUser(): void {
    this.editingUserId = null;
    this.userForm.reset({ role: 'CONSULTANT', actif: true });
    this.userForm.get('motDePasse')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('motDePasse')?.updateValueAndValidity();
    this.showUserModal = true;
  }

  openEditUser(u: Utilisateur): void {
    this.editingUserId = u.id!;
    this.userForm.patchValue({ nom: u.nom, email: u.email, role: u.role, actif: u.actif });
    this.userForm.get('motDePasse')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('motDePasse')?.updateValueAndValidity();
    this.showUserModal = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    const data = this.userForm.value;
    const obs = this.editingUserId
      ? this.utilisateurService.update(this.editingUserId, data)
      : this.utilisateurService.create(data);
    obs.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showSuccess(this.editingUserId ? 'Utilisateur modifié' : 'Utilisateur créé');
          this.showUserModal = false;
          this.loadUtilisateurs();
        }
      },
      error: () => this.showError('Erreur lors de la sauvegarde')
    });
  }

  toggleActif(u: Utilisateur): void {
    this.utilisateurService.update(u.id!, { actif: !u.actif }).subscribe({
      next: () => this.loadUtilisateurs(),
      error: () => this.showError('Erreur')
    });
  }

  deleteUser(id: number | undefined): void {
    if (!id) return;
    const u = this.utilisateurs.find(x => x.id === id);
    if (u?.role === 'ADMIN') {
      this.showError('Impossible de supprimer un Administrateur');
      return;
    }
    if (!confirm('Confirmer la suppression de cet utilisateur ?')) return;
    this.utilisateurService.delete(id).subscribe({
      next: () => { this.showSuccess('Utilisateur supprimé'); this.loadUtilisateurs(); },
      error: () => this.showError('Erreur suppression')
    });
  }

  getRoleBadge(role: string): string {
    const map: Record<string, string> = {
      ADMIN: '#C4952A', CONSULTANT: '#3b82f6'
    };
    return map[role] || '#6b7280';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur', CONSULTANT: 'Consultant'
    };
    return map[role] || role;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
