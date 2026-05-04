import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ServiceItem {
  titre: string;
  description: string;
  icone: string;
}

interface Categorie {
  id: string;
  titre: string;
  sousTitre: string;
  icone: string;
  services: ServiceItem[];
}

@Component({
  selector: 'app-services-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services-detail.component.html',
  styleUrls: ['./services-detail.component.css']
})
export class ServicesDetailComponent {

  activeTab = 'SERVICES';

  readonly categories: Categorie[] = [
    {
      id: 'SERVICES',
      titre: 'Conseil & Management',
      sousTitre: 'Des expertises stratégiques pour piloter votre croissance',
      icone: 'fas fa-briefcase',
      services: [
        {
          titre: 'Gestion de Projet',
          description: 'Nous accompagnons vos équipes dans la structuration et le pilotage de vos projets, de la phase d\'étude de faisabilité jusqu\'à la livraison. Nos experts assurent la planification rigoureuse, le suivi des jalons, la gestion des parties prenantes et l\'optimisation des ressources pour garantir la réussite dans les délais et le budget convenus.',
          icone: 'fas fa-tasks'
        },
        {
          titre: 'Services Financiers',
          description: 'Nous offrons un accompagnement complet en matière de planification financière stratégique, de conseil en investissement et de gestion des risques. Nos consultants spécialisés vous aident à optimiser vos coûts, structurer vos opérations de fusions-acquisitions et renforcer la solidité financière de votre organisation.',
          icone: 'fas fa-chart-line'
        },
        {
          titre: 'Management des Opérations',
          description: 'Nous analysons et réorganisons vos processus opérationnels pour en maximiser l\'efficacité. De la gestion de la chaîne d\'approvisionnement à l\'intégration technologique, en passant par l\'assurance qualité, nous transformons vos opérations en leviers de performance durable.',
          icone: 'fas fa-cogs'
        },
        {
          titre: 'Stratégie d\'Entreprise',
          description: 'Nous réalisons des études de marché approfondies et développons des stratégies d\'entreprise sur mesure. Notre approche intègre la conformité réglementaire, le positionnement concurrentiel et la stratégie de communication marketing pour vous donner un avantage décisif sur votre marché.',
          icone: 'fas fa-bullseye'
        }
      ]
    },
    {
      id: 'TECH_IA',
      titre: 'Tech & Intelligence Artificielle',
      sousTitre: 'Des solutions technologiques innovantes pour accélérer votre transformation',
      icone: 'fas fa-microchip',
      services: [
        {
          titre: 'Intelligence Artificielle',
          description: 'Nous développons des solutions IA sur mesure adaptées à vos enjeux métier : machine learning, traitement du langage naturel, vision par ordinateur et automatisation intelligente. Nos équipes intègrent ces technologies directement dans vos processus pour créer de la valeur mesurable et durable.',
          icone: 'fas fa-brain'
        },
        {
          titre: 'Transformation Digitale',
          description: 'Nous vous accompagnons dans votre transition numérique de bout en bout : audit de maturité digitale, feuille de route stratégique, modernisation des systèmes d\'information et formation des équipes. Nous garantissons une adoption réussie à chaque étape du changement.',
          icone: 'fas fa-laptop-code'
        },
        {
          titre: 'Data Analytics',
          description: 'Nous exploitons la puissance de vos données pour vous aider à prendre de meilleures décisions. De la collecte à la visualisation, nous construisons des pipelines de données robustes, des tableaux de bord interactifs et des modèles analytiques qui transforment vos données en insights actionnables.',
          icone: 'fas fa-chart-bar'
        },
        {
          titre: 'Automatisation IA',
          description: 'Nous identifions et automatisons vos tâches répétitives à faible valeur ajoutée grâce à des agents intelligents et des workflows automatisés. Nos solutions libèrent le potentiel humain de vos équipes et réduisent considérablement les délais de traitement opérationnel.',
          icone: 'fas fa-robot'
        }
      ]
    },
    {
      id: 'EXPERTISE',
      titre: 'Expertise',
      sousTitre: 'Un regard expert et indépendant sur vos défis les plus complexes',
      icone: 'fas fa-award',
      services: [
        {
          titre: 'Conseil Stratégique',
          description: 'Nos consultants seniors apportent une expertise de haut niveau pour résoudre vos problématiques les plus complexes. Ils mobilisent des méthodologies éprouvées et une connaissance sectorielle pointue pour formuler des recommandations concrètes et immédiatement opérationnelles.',
          icone: 'fas fa-lightbulb'
        },
        {
          titre: 'Audit & Conformité',
          description: 'Nous réalisons des audits organisationnels et réglementaires complets pour identifier les risques et garantir votre conformité. De la certification qualité à la gestion des risques opérationnels, nous vous aidons à sécuriser vos activités et à renforcer votre gouvernance.',
          icone: 'fas fa-shield-alt'
        },
        {
          titre: 'Développement Durable & RSE',
          description: 'Nous vous accompagnons dans l\'intégration des enjeux de responsabilité sociale et environnementale au cœur de votre stratégie. Construction d\'un modèle d\'affaires durable, mesure de l\'impact environnemental et élaboration de votre rapport RSE selon les standards internationaux.',
          icone: 'fas fa-leaf'
        }
      ]
    },
    {
      id: 'FORMATION',
      titre: 'Formation',
      sousTitre: 'Développer les compétences de vos équipes pour relever les défis de demain',
      icone: 'fas fa-graduation-cap',
      services: [
        {
          titre: 'Formation sur Mesure',
          description: 'Nous concevons des programmes de formation entièrement personnalisés, construits autour des besoins spécifiques de vos équipes et de vos enjeux métier. Chaque parcours est co-construit avec vos managers pour garantir une montée en compétences rapide, mesurable et durable.',
          icone: 'fas fa-graduation-cap'
        },
        {
          titre: 'Coaching Exécutif',
          description: 'Nous proposons un accompagnement individuel de haut niveau pour vos dirigeants et managers. Nos coachs certifiés travaillent sur le développement du leadership, la prise de décision sous pression, la gestion des équipes et l\'impact managérial dans des contextes de transformation.',
          icone: 'fas fa-user-tie'
        },
        {
          titre: 'Ateliers Agile & Innovation',
          description: 'Nous animons des ateliers pratiques et immersifs pour accélérer l\'adoption des méthodes agiles et stimuler la culture d\'innovation. Design Thinking, Scrum, Lean Startup : nos facilitateurs expérimentés transforment vos équipes en acteurs de l\'innovation continue.',
          icone: 'fas fa-rocket'
        },
        {
          titre: 'E-Learning & Blended Learning',
          description: 'Nous développons des solutions d\'apprentissage hybrides qui combinent sessions présentielles et modules digitaux interactifs. Nos dispositifs blended learning maximisent l\'engagement des apprenants, facilitent l\'ancrage des connaissances et s\'adaptent aux contraintes de vos équipes terrain.',
          icone: 'fas fa-laptop'
        }
      ]
    }
  ];

  get activeCategorie(): Categorie {
    return this.categories.find(c => c.id === this.activeTab) || this.categories[0];
  }

  setActive(id: string): void {
    this.activeTab = id;
  }
}
