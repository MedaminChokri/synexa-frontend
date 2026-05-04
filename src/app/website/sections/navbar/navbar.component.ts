import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = false;
  isMobileMenuOpen = false;
  currentLang = 'fr';

  constructor(private router: Router, private translate: TranslateService) {
    const savedLang = localStorage.getItem('synexa_lang') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
    this.applyDirection(savedLang);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  scrollTo(sectionId: string): void {
    this.closeMobileMenu();
    if (this.router.url === '/' || this.router.url.startsWith('/#')) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/'], { fragment: sectionId });
    }
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('synexa_lang', lang);
    this.applyDirection(lang);
  }

  applyDirection(lang: string): void {
    const body = document.body;
    if (lang === 'ar') {
      body.setAttribute('dir', 'rtl');
      body.style.fontFamily = "'Noto Sans Arabic', 'Inter', sans-serif";
    } else {
      body.setAttribute('dir', 'ltr');
      body.style.fontFamily = "'Inter', sans-serif";
    }
  }
}
