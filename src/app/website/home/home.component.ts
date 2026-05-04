import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  readonly today = new Date();

  readonly whyItems = [
    { icon: 'fas fa-crosshairs',   titre: 'Orientés résultats',         desc: 'Chaque mission est pilotée avec des indicateurs clairs et des livrables mesurables. Votre ROI est notre priorité.' },
    { icon: 'fas fa-users',        titre: 'Consultants seniors',         desc: 'Nos équipes sont composées d\'experts terrain avec plus de 10 ans d\'expérience dans leurs domaines respectifs.' },
    { icon: 'fas fa-map-marked-alt', titre: 'Expertise locale & globale', desc: 'Ancrés en Afrique du Nord, nous opérons selon les standards internationaux avec une connaissance fine des marchés locaux.' },
    { icon: 'fas fa-sync-alt',     titre: 'Approche agile',              desc: 'Nos méthodologies s\'adaptent à la taille et au rythme de votre organisation pour une transformation progressive et maîtrisée.' },
    { icon: 'fas fa-lock',         titre: 'Confidentialité totale',      desc: 'Chaque engagement est couvert par un accord de confidentialité strict. Vos données et stratégies restent protégées.' },
    { icon: 'fas fa-headset',      titre: 'Suivi post-mission',          desc: 'Notre accompagnement ne s\'arrête pas à la livraison. Nous assurons un suivi et un support pour garantir l\'ancrage des résultats.' }
  ];

  readonly services = [
    { icon: '◌', title: 'Conseil Stratégique',        description: 'Définir une feuille de route claire pour accélérer la croissance et la compétitivité de votre organisation.',  link: '/services/conseil'   },
    { icon: '▦', title: 'Transformation Digitale',    description: 'Moderniser vos processus, systèmes et pratiques pour créer de la valeur durable et rester compétitif.',         link: '/services/tech-ia'   },
    { icon: '◳', title: 'Pilotage de Projets',        description: 'Sécuriser coûts, délais et qualité avec un PMO structuré et des méthodes agiles orientées résultats.',          link: '/services/conseil'   },
    { icon: '◍', title: 'Excellence Opérationnelle',  description: 'Optimiser vos opérations pour améliorer la performance, réduire les coûts et renforcer la qualité de service.', link: '/services/expertise' },
    { icon: '◎', title: 'Formation & Coaching',       description: 'Développer les compétences de vos équipes grâce à des parcours pratiques, ciblés et immédiatement applicables.', link: '/services/formation' }
  ];

  readonly steps = [
    { titre: 'Diagnostic',     desc: 'Nous analysons votre organisation, vos processus et vos enjeux pour comprendre précisément votre situation et identifier les leviers de performance.' },
    { titre: 'Conception',     desc: 'Nous co-construisons avec vos équipes une feuille de route stratégique, un plan d\'action détaillé et des indicateurs de succès clairs.' },
    { titre: 'Déploiement',    desc: 'Nos consultants s\'intègrent à vos équipes pour piloter la mise en œuvre des solutions, en garantissant adoption et qualité d\'exécution.' },
    { titre: 'Consolidation',  desc: 'Nous mesurons les résultats, documentons les bonnes pratiques et assurons le transfert de compétences pour ancrer durablement les transformations.' }
  ];

  readonly secteurs = [
    { icon: 'fas fa-university',       label: 'Banque & Finance'       },
    { icon: 'fas fa-industry',         label: 'Industrie & Manufacture' },
    { icon: 'fas fa-signal',           label: 'Télécommunications'      },
    { icon: 'fas fa-heartbeat',        label: 'Santé & Pharma'          },
    { icon: 'fas fa-shopping-cart',    label: 'Distribution & Retail'   },
    { icon: 'fas fa-graduation-cap',   label: 'Éducation & Formation'   },
    { icon: 'fas fa-solar-panel',      label: 'Énergie & Utilities'     },
    { icon: 'fas fa-plane',            label: 'Transport & Logistique'  }
  ];

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const observeNew = () => {
      document.querySelectorAll('.animate-on-scroll:not(.observed)').forEach((el) => {
        el.classList.add('observed');
        observer.observe(el);
      });
    };

    observeNew();
    const mutationObserver = new MutationObserver(observeNew);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
}
