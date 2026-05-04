
export interface Contact {
    id?: number;
    nom: string;
    email: string;
    telephone?: string;
    entreprise?: string;
    message: string;
    dateEnvoi?: string;
    lu?: boolean;
    repondu?: boolean;
    client?: { id: number; nom: string; email: string } | null;
}
