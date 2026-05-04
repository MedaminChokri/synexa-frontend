import { Component, OnInit } from '@angular/core';
import { Insight } from '../../../models/insight.model';
import { InsightService } from '../../../core/services/insight.service';
import { catchError, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.css']
})
export class InsightsComponent implements OnInit {
  insights: Insight[] = [];
  loading = true;
  activeTab: string = 'BLOG';

  private cache: { [key: string]: Insight[] } = {};

  private defaultInsights: { [key: string]: Insight[] } = {
    BLOG: [
      {
        id: 1,
        titre: 'La transformation digitale au cœur des entreprises africaines',
        resume: 'Comment les entreprises africaines accélèrent leur transformation numérique pour rester compétitives à l\'échelle mondiale.',
        auteur: 'SYNEXA',
        categorie: 'BLOG',
        imageUrl: '',
        datePublication: '2024-03-15',
        actif: true
      },
      {
        id: 2,
        titre: 'L\'Intelligence Artificielle au service du conseil stratégique',
        resume: 'Les nouvelles opportunités offertes par l\'IA pour optimiser les processus décisionnels et améliorer la performance des organisations.',
        auteur: 'SYNEXA',
        categorie: 'BLOG',
        imageUrl: '',
        datePublication: '2024-02-10',
        actif: true
      },
      {
        id: 3,
        titre: 'Management de projet international : les clés du succès',
        resume: 'Retour d\'expérience sur les meilleures pratiques de gestion de projets complexes dans un contexte multiculturel.',
        auteur: 'SYNEXA',
        categorie: 'BLOG',
        imageUrl: '',
        datePublication: '2024-01-20',
        actif: true
      }
    ],
    ETUDE_CAS: [
      {
        id: 4,
        titre: 'Optimisation des coûts opérationnels : -30% pour un groupe bancaire',
        resume: 'Comment SYNEXA a accompagné un groupe bancaire maghrébin dans l\'optimisation de ses processus pour réduire ses coûts de 30% en 18 mois.',
        auteur: 'SYNEXA',
        categorie: 'ETUDE_CAS',
        imageUrl: '',
        datePublication: '2024-03-01',
        actif: true
      },
      {
        id: 5,
        titre: 'Déploiement d\'une solution IA dans le secteur télécom',
        resume: 'Mise en place d\'un système de prédiction de churn basé sur le machine learning pour un opérateur télécoms leader en Afrique.',
        auteur: 'SYNEXA',
        categorie: 'ETUDE_CAS',
        imageUrl: '',
        datePublication: '2023-11-15',
        actif: true
      }
    ]
  };

  constructor(
    private insightService: InsightService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const queryTab = this.route.snapshot.queryParamMap.get('tab');
    const initialTab = queryTab === 'ETUDE_CAS' ? 'ETUDE_CAS' : 'BLOG';
    this.activeTab = initialTab;
    this.loadTab(initialTab);
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (this.cache[tab]) {
      this.insights = this.cache[tab];
    } else {
      this.loadTab(tab);
    }
  }

  private loadTab(tab: string): void {
    this.loading = true;
    this.insightService.getInsightsByCategorie(tab)
      .pipe(
        catchError(() => {
          this.insights = this.defaultInsights[tab] || [];
          this.cache[tab] = this.insights;
          this.loading = false;
          return of({ success: false, message: 'Erreur', data: [] as Insight[] });
        })
      )
      .subscribe(response => {
        if (response.success && response.data && response.data.length > 0) {
          this.insights = response.data;
        } else {
          this.insights = this.defaultInsights[tab] || [];
        }
        this.cache[tab] = this.insights;
        this.loading = false;
      });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
