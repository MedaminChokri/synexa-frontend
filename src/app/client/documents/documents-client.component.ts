import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentClientService } from '../../core/services/document-client.service';

@Component({
  selector: 'app-documents-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents-client.component.html',
  styleUrls: ['./documents-client.component.css']
})
export class DocumentsClientComponent implements OnInit {
  documents: any[] = [];
  loading = false;
  clientId = 0;
  pdfLoading: { [key: number]: boolean } = {};

  constructor(private documentService: DocumentClientService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      this.clientId = JSON.parse(stored).id;
      this.loadDocuments();
    }
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocuments(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.documents = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  downloadDocument(docId: number, nomFichier: string): void {
    this.pdfLoading[docId] = true;
    this.documentService.downloadDocument(docId).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
        this.pdfLoading[docId] = false;
      },
      error: () => this.pdfLoading[docId] = false
    });
  }

  getFileIcon(type: string): string {
    if (!type) return 'fa-file';
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('image')) return 'fa-file-image';
    if (type.includes('word') || type.includes('doc')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel';
    return 'fa-file';
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
