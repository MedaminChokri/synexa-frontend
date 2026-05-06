import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'fr' | 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'synexa_lang';
  currentLang: AppLang = 'fr';

  constructor(private translate: TranslateService) {
    const saved = (typeof localStorage !== 'undefined' && (localStorage.getItem(this.STORAGE_KEY) as AppLang)) || 'fr';
    this.use(saved);
  }

  use(lang: AppLang): void {
    this.currentLang = lang;
    this.translate.use(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
    this.applyDirection(lang);
  }

  private applyDirection(lang: AppLang): void {
    if (typeof document === 'undefined') return;
    const isRtl = lang === 'ar';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.body.style.fontFamily = isRtl
      ? "'Noto Sans Arabic', 'Inter', sans-serif"
      : "'Inter', sans-serif";
  }
}
