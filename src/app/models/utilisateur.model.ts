export interface Utilisateur {
    id?: number;
    nom: string;
    email: string;
    motDePasse?: string;
    role: string; // ADMIN, CONSULTANT
    actif: boolean;
    dateCreation?: string;
}