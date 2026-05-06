import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Transforms a raw status code (e.g. "EN_ATTENTE") into a human-readable
 * label using the i18n `statuts.*` keys.
 *
 * Usage:  {{ rdv.statut | statutHumain }}
 *
 * Falls back to the raw code if no translation is found.
 */
@Pipe({
  name: 'statutHumain',
  standalone: true,
  pure: false // needs to react to language changes
})
export class StatutHumainPipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(value: string | null | undefined): string {
    if (!value) return '';
    const key = `statuts.${value}`;
    const translated = this.translate.instant(key);
    // If ngx-translate returns the key itself, no translation was found → return raw value
    return translated === key ? value : translated;
  }
}
