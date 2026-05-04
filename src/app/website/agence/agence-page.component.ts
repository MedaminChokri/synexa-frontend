import { Component } from '@angular/core';

@Component({
  selector: 'app-agence-page',
  templateUrl: './agence-page.component.html',
  styleUrls: ['./agence-page.component.css']
})
export class AgencePageComponent {

  readonly histoire = [
    { titre: 'Notre Histoire', contenu: 'Fondée en 2018, SYNEXA est née de la conviction que les entreprises africaines et européennes méritent un conseil de classe mondiale. Nous combinons expertise locale et standards internationaux pour délivrer des résultats concrets et durables.', icone: 'fas fa-history' },
    { titre: 'Notre Mission', contenu: 'Accompagner les organisations dans leur transformation en mobilisant les meilleurs talents et les méthodologies les plus avancées. Nous croyons fermement que chaque entreprise peut atteindre son plein potentiel avec le bon partenaire stratégique.', icone: 'fas fa-bullseye' },
    { titre: 'Notre Vision', contenu: 'Devenir le cabinet de conseil de référence en Afrique du Nord et en Europe pour les entreprises en quête de performance durable et d\'innovation. Bâtir des ponts entre les marchés et accélérer la croissance de nos clients.', icone: 'fas fa-eye' },
  ];

  readonly valeurs = [
    { titre: 'Excellence', contenu: 'Nous visons l\'excellence dans chaque mission. Nos consultants sont sélectionnés pour leur expertise pointue et leur capacité à délivrer des résultats mesurables qui font une différence réelle.', icone: 'fas fa-star' },
    { titre: 'Intégrité', contenu: 'La confiance est le fondement de toute relation durable. Nous opérons avec une transparence totale, des engagements tenus et une éthique professionnelle irréprochable dans toutes nos interactions.', icone: 'fas fa-handshake' },
    { titre: 'Innovation', contenu: 'Le monde évolue rapidement. Nous investissons continuellement dans les nouvelles méthodologies et technologies pour apporter à nos clients des solutions avant-gardistes et adaptées aux défis de demain.', icone: 'fas fa-lightbulb' },
    { titre: 'Partenariat', contenu: 'Nous ne sommes pas de simples prestataires mais de véritables partenaires. Nous nous impliquons pleinement dans vos projets et partageons vos ambitions pour co-construire votre succès.', icone: 'fas fa-users' },
  ];
}
