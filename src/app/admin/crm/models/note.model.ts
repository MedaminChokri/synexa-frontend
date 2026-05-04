/**
 * Modèle d'une note CRM
 */
export interface CrmNote {
  id?: number;
  leadId: number;
  auteur: string;
  contenu: string;
  type: 'APPEL' | 'EMAIL' | 'RDV' | 'NOTE';
  dateCreation?: string;
}
