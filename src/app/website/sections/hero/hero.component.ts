import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  clients: string[] = ['KPMG', 'Ooredoo', 'Bank of Africa', 'BIAT', 'Airbus', 'LBBW Bank', 'Esprit University', 'Dräxlmaier'];
  duplicatedClients: string[] = [];
  currentSlide = 0;
  private slideInterval: any;

  ngOnInit(): void {
    this.duplicatedClients = [...this.clients, ...this.clients];
    this.startSlider();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = this.currentSlide === 0 ? 1 : 0;
    }, 5000);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onImageError(event: any): void {
    console.error('Image non trouvée:', event.target.src);
  }
}