import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../models/utilisateur.model';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-utilisateurs-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './utilisateurs-admin.component.html',
  styleUrl: './utilisateurs-admin.component.css'
})
export class UtilisateursAdminComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  loading = true;
  showModal = false;
  userForm: FormGroup;
  editingUserId: number | null = null;
  successMsg = '';
  errorMsg = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.minLength(6)],
      role: ['CONSULTANT', Validators.required],
      actif: [true]
    });
  }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.utilisateurService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.utilisateurs = response.data;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.errorMsg = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        this.clearMessages();
      }
    });
  }

  openAddModal(): void {
    this.editingUserId = null;
    this.userForm.reset({ role: 'CONSULTANT', actif: true });
    this.userForm.get('motDePasse')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('motDePasse')?.updateValueAndValidity();
    this.showModal = true;
  }

  openEditModal(user: Utilisateur): void {
    this.editingUserId = user.id!;
    this.userForm.patchValue({
      nom: user.nom,
      email: user.email,
      role: user.role,
      actif: user.actif
    });
    this.userForm.get('motDePasse')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('motDePasse')?.updateValueAndValidity();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.editingUserId) {
        this.utilisateurService.update(this.editingUserId, userData).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.successMsg = 'Utilisateur modifié avec succès ✓';
              this.loadUtilisateurs();
              this.closeModal();
              this.clearMessages();
            }
          },
          error: (error: any) => {
            this.errorMsg = 'Erreur lors de la mise à jour';
            this.clearMessages();
          }
        });
      } else {
        this.utilisateurService.create(userData).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.successMsg = 'Utilisateur créé avec succès ✓';
              this.loadUtilisateurs();
              this.closeModal();
              this.clearMessages();
            }
          },
          error: (error: any) => {
            this.errorMsg = 'Erreur lors de la création';
            this.clearMessages();
          }
        });
      }
    }
  }

  toggleActif(user: Utilisateur): void {
    this.utilisateurService.update(user.id!, { actif: !user.actif }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadUtilisateurs();
        }
      },
      error: (error: any) => console.error('Erreur lors de la modification de l\'état', error)
    });
  }

  deleteUser(id: number | undefined): void {
    if (!id) return;
    
    // Double check: prevent admin deletion
    const user = this.utilisateurs.find(u => u.id === id);
    if (user && user.role === 'ADMIN') {
      this.errorMsg = 'Impossible de supprimer un administrateur !';
      this.clearMessages();
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    this.utilisateurService.delete(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMsg = 'Utilisateur supprimé avec succès ✓';
          this.loadUtilisateurs();
          this.clearMessages();
        }
      },
      error: (error: any) => {
        this.errorMsg = 'Erreur lors de la suppression';
        this.clearMessages();
      }
    });
  }

  clearMessages(): void {
    setTimeout(() => { this.successMsg = ''; this.errorMsg = ''; }, 4000);
  }
}
