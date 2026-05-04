export interface Insight {
  id: number;
  titre: string;
  resume: string;
  contenu?: string;
  auteur: string;
  categorie: string; // BLOG | ETUDE_CAS
  imageUrl?: string;
  datePublication: string;
  actif: boolean;
}
