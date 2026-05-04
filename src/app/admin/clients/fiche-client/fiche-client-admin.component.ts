import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { DocumentClientService } from '../../../core/services/document-client.service';
import { ContratService } from '../../../core/services/contrat.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-fiche-client-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fiche-client-admin.component.html',
  styleUrls: ['./fiche-client-admin.component.css']
})
export class FicheClientAdminComponent implements OnInit {
  clientId: number = 0;
  client: any = null;
  loading = false;
  
  documents: any[] = [];
  contrats: any[] = [];

  // Doc modal
  showDocModal = false;
  nouveauDocTitle = '';
  nouveauDocDesc = '';
  nouveauDocFile: File | null = null;
  uploadingDoc = false;

  // Contrat modal
  showContratModal = false;
  nouveauContratTitre = '';
  nouveauContratDesc = '';
  nouveauContratFichierBase64 = '';
  nouveauContratFileName = '';
  uploadingContrat = false;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private documentService: DocumentClientService,
    private contratService: ContratService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clientId = parseInt(id, 10);
      this.loadClient();
      this.loadDocuments();
      this.loadContrats();
    }
  }

  goBack(): void {
    this.location.back();
  }

  loadClient(): void {
    this.loading = true;
    this.clientService.getById(this.clientId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) this.client = res.data;
      },
      error: () => { this.loading = false; }
    });
  }

  loadDocuments(): void {
    this.documentService.getDocuments(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) this.documents = res.data || [];
      },
      error: () => { this.documents = []; }
    });
  }

  loadContrats(): void {
    this.contratService.getContratsClient(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) this.contrats = res.data || [];
      },
      error: () => { this.contrats = []; }
    });
  }

  // ---- Documents ----

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.nouveauDocFile = event.target.files[0];
    }
  }

  uploadDocument(): void {
    if (!this.nouveauDocTitle || !this.nouveauDocFile) return;
    this.uploadingDoc = true;

    const file = this.nouveauDocFile;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Full = reader.result as string;
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = base64Full.includes(',') ? base64Full.split(',')[1] : base64Full;

      const payload = {
        titre: this.nouveauDocTitle,
        description: this.nouveauDocDesc,
        nomFichier: file.name,
        typeFichier: file.type || 'application/octet-stream',
        tailleFichier: file.size,
        contenuBase64: base64,
        uploadePar: localStorage.getItem('admin_username') || 'Admin'
      };

      this.documentService.uploadDocument(this.clientId, payload).subscribe({
        next: (res: any) => {
          this.uploadingDoc = false;
          if (res.success) {
            this.showDocModal = false;
            this.nouveauDocTitle = '';
            this.nouveauDocDesc = '';
            this.nouveauDocFile = null;
            this.loadDocuments();
          }
        },
        error: () => { this.uploadingDoc = false; }
      });
    };
    reader.readAsDataURL(file);
  }

  // ---- Contrats ----

  onContratFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.nouveauContratFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.nouveauContratFichierBase64 = (reader.result as string).split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  genererContrat(): void {
    if (!this.nouveauContratTitre || !this.nouveauContratFichierBase64) return;
    this.uploadingContrat = true;
    this.contratService.envoyerContrat(this.clientId, {
      titre: this.nouveauContratTitre,
      description: this.nouveauContratDesc,
      fichierOriginalBase64: this.nouveauContratFichierBase64
    }).subscribe({
      next: (res: any) => {
        this.uploadingContrat = false;
        if (res.success) {
          this.showContratModal = false;
          this.nouveauContratTitre = '';
          this.nouveauContratDesc = '';
          this.nouveauContratFichierBase64 = '';
          this.nouveauContratFileName = '';
          this.loadContrats();
        }
      },
      error: () => { this.uploadingContrat = false; }
    });
  }

  getContratStatutClass(statut: string): string {
    switch (statut) {
      case 'SIGNE': return 'badge-signe';
      case 'EN_ATTENTE': return 'badge-attente';
      default: return 'badge-neutral';
    }
  }

  formatBytes(bytes: any): string {
    if (!bytes) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
  }
}
