import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContratService } from '../../core/services/contrat.service';

@Component({
  selector: 'app-contrats-client',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './contrats-client.component.html',
  styleUrls: ['./contrats-client.component.css']
})
export class ContratsClientComponent implements OnInit {
  contrats: any[] = [];
  loading = false;
  clientId = 0;
  
  // Signature Modal
  showSignatureModal = false;
  contratEnCours: any = null;
  signaturePad: boolean = false;
  signatureLoading = false;

  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private isDrawing = false;
  private ctx!: CanvasRenderingContext2D | null;

  constructor(private contratService: ContratService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      this.clientId = JSON.parse(stored).id;
      this.loadContrats();
    }
  }

  loadContrats(): void {
    this.loading = true;
    this.contratService.getContratsClient(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.contrats = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  downloadPDF(docId: number, original: boolean = false): void {
    const fileName = original ? 'contrat_original.pdf' : 'contrat_signe.pdf';
    const obs$ = original ? this.contratService.visualiserContrat(docId) : this.contratService.telechargerSigne(docId);
    obs$.subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  openSignature(contrat: any): void {
    this.contratEnCours = contrat;
    this.showSignatureModal = true;
    setTimeout(() => this.initCanvas(), 100);
  }

  closeSignature(): void {
    this.showSignatureModal = false;
    this.contratEnCours = null;
  }

  initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      if (this.ctx) {
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#000000';
      }
    }
  }

  startDrawing(e: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    this.draw(e);
  }

  stopDrawing(): void {
    this.isDrawing = false;
    if (this.ctx) this.ctx.beginPath();
  }

  draw(e: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || !this.ctx || !this.canvasRef) return;
    
    e.preventDefault();
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  clearSignature(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas && this.ctx) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  validerSignature(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.contratEnCours) return;
    
    // Check if canvas is empty
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      alert("Veuillez dessiner votre signature d'abord.");
      return;
    }

    this.signatureLoading = true;
    const base64Image = canvas.toDataURL('image/png');

    this.contratService.signerContrat(this.contratEnCours.id, base64Image, '127.0.0.1').subscribe({
      next: (res: any) => {
        this.signatureLoading = false;
        if (res.success) {
          this.closeSignature();
          this.loadContrats();
        }
      },
      error: () => this.signatureLoading = false
    });
  }
}
