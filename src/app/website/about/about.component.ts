import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  values = [
    { icon: 'fas fa-star', title: 'Excellence', desc: 'Nous visons la rigueur et l\'impact mesurable à chaque mission.' },
    { icon: 'fas fa-handshake', title: 'Intégrité', desc: 'La transparence et l\'éthique guident chacune de nos actions.' },
    { icon: 'fas fa-lightbulb', title: 'Innovation', desc: 'Nous intégrons les dernières avancées pour créer de la valeur durable.' },
    { icon: 'fas fa-globe', title: 'Impact Global', desc: 'Une présence en Tunisie, Europe et Afrique pour des résultats concrets.' }
  ];

  timeline = [
    { year: '2018', event: 'Fondation de SYNEXA Consult à Tunis' },
    { year: '2019', event: 'Première expansion en Europe (France, Belgique)' },
    { year: '2021', event: 'Lancement du pôle Tech & Intelligence Artificielle' },
    { year: '2023', event: 'Expansion en Afrique subsaharienne' },
    { year: '2025', event: 'Déploiement de la plateforme digitale intégrée' }
  ];
}
