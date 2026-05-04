/**
 * Modèle d'un rendez-vous CRM
 */
export interface CrmRendezVous {
  id?: number;
  leadId?: number;
  titre: string;
  dateHeure: string;
  dureeMinutes: number;
  lieu?: string;
  type: 'PHYSIQUE' | 'VISIO';
  statut: 'PLANIFIE' | 'EFFECTUE' | 'ANNULE';
  notesPostRdv?: string;
  dateCreation?: string;
}

/** Labels français pour les statuts de RDV */
export const RDV_STATUT_LABELS: Record<string, string> = {
  PLANIFIE: 'Planifié',
  EFFECTUE: 'Effectué',
  ANNULE: 'Annulé'
};

/** Couleurs pour les statuts de RDV */
export const RDV_STATUT_COLORS: Record<string, string> = {
  PLANIFIE: '#3b82f6',
  EFFECTUE: '#10b981',
  ANNULE: '#ef4444'
};
