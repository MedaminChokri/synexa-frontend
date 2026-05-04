/**
 * Modèle d'un lead CRM
 */
export interface CrmLead {
  id?: number;
  prenom?: string;
  nom: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  secteur: 'AGROALIMENTAIRE' | 'FINANCE' | 'INDUSTRIE' | 'CONSEIL' | 'AUTRE';
  pays?: string;
  serviceSouhaite?: string;
  source: 'SITE' | 'CHATBOT' | 'MANUEL';
  etape: 'NOUVEAU' | 'CONTACTE' | 'QUALIFIE' | 'PROPOSITION' | 'SIGNE' | 'PERDU';
  consultantAssigne?: string;
  score: number;
  motifPerte?: string;
  dateCreation?: string;
  dateModification?: string;
  scoreProbabilite?: number;
  dateDerniereActivite?: string;
  tags?: string; // JSON array string
}

/** Labels français pour les étapes du pipeline */
export const ETAPE_LABELS: Record<string, string> = {
  NOUVEAU: 'Nouveau',
  CONTACTE: 'Contacté',
  QUALIFIE: 'Qualifié',
  PROPOSITION: 'Proposition',
  SIGNE: 'Signé',
  PERDU: 'Perdu'
};

/** Labels français pour les sources */
export const SOURCE_LABELS: Record<string, string> = {
  SITE: 'Site web',
  CHATBOT: 'Chatbot',
  MANUEL: 'Manuel'
};

/** Labels français pour les secteurs */
export const SECTEUR_LABELS: Record<string, string> = {
  AGROALIMENTAIRE: 'Agroalimentaire',
  FINANCE: 'Finance',
  INDUSTRIE: 'Industrie',
  CONSEIL: 'Conseil',
  AUTRE: 'Autre'
};

/** Couleurs associées aux étapes pour le pipeline */
export const ETAPE_COLORS: Record<string, string> = {
  NOUVEAU: '#3b82f6',
  CONTACTE: '#8b5cf6',
  QUALIFIE: '#f59e0b',
  PROPOSITION: '#f97316',
  SIGNE: '#10b981',
  PERDU: '#ef4444'
};
