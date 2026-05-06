import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService, AppLang } from '../../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = false;
  isMobileMenuOpen = false;

  constructor(private router: Router, private languageService: LanguageService) {}

  get currentLang(): AppLang {
    return this.languageService.currentLang;
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

  switchLanguage(lang: AppLang): void {
    this.languageService.use(lang);
  }
}
