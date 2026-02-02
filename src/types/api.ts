// Types pour l'API Backend UICI

export type Role = 'ADMIN_GLOBAL' | 'ADMIN_COLLEGE' | 'ENSEIGNANT' | 'ETUDIANT' | 'PARENT';

export type StatutInscription = 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';

// Auth
export interface User {
  id: string;
  email: string;
  role: Role;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  nom: string;
  prenom: string;
  telephone?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

// College
export interface College {
  id: string;
  nom: string;
  siteWeb?: string;
  adresse?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    departements: number;
    salles: number;
    adminColleges: number;
  };
}

// Année Scolaire
export interface AnneeScolaire {
  id: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  estActive: boolean;
  createdAt: string;
  _count?: {
    inscriptions: number;
    notes: number;
    cours: number;
  };
}

// Département
export interface Departement {
  id: string;
  nom: string;
  collegeId: string;
  createdAt: string;
  college?: {
    id: string;
    nom: string;
  };
  _count?: {
    matieres: number;
    enseignantDepartements: number;
  };
}

// Salle
export interface Salle {
  id: string;
  nom: string;
  capacite?: number;
  collegeId: string;
  createdAt: string;
  college?: {
    id: string;
    nom: string;
  };
  _count?: {
    inscriptions: number;
    cours: number;
  };
}

// Enseignant
export interface Enseignant {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  telephone?: string;
  createdAt: string;
  user?: User;
}

// Etudiant
export interface Etudiant {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  dateNais?: string;
  lieuNais?: string;
  telephone?: string;
  anneeEntree?: number;
  createdAt: string;
  user?: User;
}

// Parent
export interface Parent {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  telephone?: string;
  createdAt: string;
  user?: User;
  parentEtudiants?: {
    id: string;
    etudiant: Etudiant;
  }[];
}

// Inscription
export interface Inscription {
  id: string;
  etudiantId: string;
  anneeScolaireId: string;
  salleId?: string;
  statut: StatutInscription;
  createdAt: string;
  updatedAt?: string;
  etudiant?: Etudiant;
  anneeScolaire?: AnneeScolaire;
  salle?: Salle & {
    college?: College;
  };
}

export interface DemandeInscriptionRequest {
  collegeId: string;
  anneeScolaireId: string;
}

export interface ReponseInscriptionRequest {
  statut: 'ACCEPTE' | 'REFUSE';
  salleId?: string;
}

// Matière
export interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
  departementId: string;
  createdAt: string;
  departement?: Departement;
}

// Note
export interface Note {
  id: string;
  valeur: number;
  commentaire?: string;
  dateNote: string;
  etudiantId: string;
  matiereId: string;
  anneeScolaireId: string;
  createdAt: string;
  etudiant?: Etudiant;
  matiere?: Matiere;
  anneeScolaire?: AnneeScolaire;
}

export interface StatistiquesEtudiant {
  etudiant: Etudiant;
  anneeScolaire: AnneeScolaire;
  notes: Note[];
  statistiques: {
    moyenne: number;
    nombreNotes: number;
    noteMin: number;
    noteMax: number;
    totalCoefficients: number;
    moyennePonderee: number;
  };
}

// Dashboard Stats
export interface DashboardStats {
  colleges?: number;
  departements?: number;
  enseignants?: number;
  etudiants?: number;
  inscriptionsEnAttente?: number;
  salles?: number;
  matieres?: number;
  notes?: number;
}
