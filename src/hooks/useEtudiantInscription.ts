import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Inscription, College, Salle, AnneeScolaire } from '@/types/api';

export interface InscriptionDetails {
  id: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  createdAt: string;
  updatedAt?: string;
  college?: College;
  salle?: Salle;
  anneeScolaire?: AnneeScolaire;
}

export function useEtudiantInscription() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['etudiant-inscription', user?.id],
    queryFn: async () => {
      // Récupère l'inscription de l'étudiant connecté
      const response = await apiGet<InscriptionDetails[]>('/inscriptions/me');
      if (response.success && response.data && response.data.length > 0) {
        // Retourne la dernière inscription
        return response.data[0];
      }
      return null;
    },
    enabled: user?.role === 'ETUDIANT',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const inscription = data || null;
  const isAccepted = inscription?.statut === 'ACCEPTE';
  const isPending = inscription?.statut === 'EN_ATTENTE';
  const isRefused = inscription?.statut === 'REFUSE';
  const hasInscription = !!inscription;

  return {
    inscription,
    isLoading,
    error,
    refetch,
    isAccepted,
    isPending,
    isRefused,
    hasInscription,
  };
}
