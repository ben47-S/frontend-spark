import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import type { College, AnneeScolaire, Inscription, ApiResponse } from '@/types/api';
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function EtudiantInscription() {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [anneeScolaire, setAnneeScolaire] = useState<AnneeScolaire | null>(null);
  const [existingInscription, setExistingInscription] = useState<Inscription | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch colleges and active year in parallel
        const [collegesRes, anneeRes, inscriptionsRes] = await Promise.all([
          apiGet<College[]>('/colleges', { requiresAuth: false }),
          apiGet<AnneeScolaire>('/annees-scolaires/active'),
          apiGet<Inscription[]>('/inscriptions'),
        ]);

        if (collegesRes.success && collegesRes.data) {
          setColleges(collegesRes.data);
        }

        if (anneeRes.success && anneeRes.data) {
          setAnneeScolaire(anneeRes.data);
          
          // Check if student already has inscription for this year
          if (inscriptionsRes.success && inscriptionsRes.data) {
            const existing = inscriptionsRes.data.find(
              (i) => i.anneeScolaireId === anneeRes.data.id
            );
            if (existing) {
              setExistingInscription(existing);
            }
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollegeId || !anneeScolaire) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiPost<Inscription>('/inscriptions/demandes', {
        collegeId: selectedCollegeId,
        anneeScolaireId: anneeScolaire.id,
      });

      if (response.success && response.data) {
        setExistingInscription(response.data);
        setSuccess('Demande d\'inscription soumise avec succès !');
      } else {
        setError(response.error?.message || 'Erreur lors de la soumission');
      }
    } catch (err) {
      setError('Erreur lors de la soumission de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'ACCEPTE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Acceptée
          </span>
        );
      case 'REFUSE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
            <XCircle className="h-4 w-4" />
            Refusée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-4 w-4" />
            En attente
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscription</h1>
          <p className="text-muted-foreground">
            Gérez votre inscription pour l'année scolaire
          </p>
        </div>

        {/* Current year info */}
        {anneeScolaire && (
          <Card>
            <CardHeader>
              <CardTitle>Année scolaire active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <span className="text-lg font-bold text-primary">{anneeScolaire.libelle}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Du {new Date(anneeScolaire.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(anneeScolaire.dateFin).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing inscription or form */}
        {existingInscription ? (
          <Card>
            <CardHeader>
              <CardTitle>Votre demande d'inscription</CardTitle>
              <CardDescription>
                Statut de votre demande pour l'année {anneeScolaire?.libelle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Statut de la demande</p>
                  <p className="text-sm text-muted-foreground">
                    Soumise le {new Date(existingInscription.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {getStatusBadge(existingInscription.statut)}
              </div>

              {existingInscription.statut === 'ACCEPTE' && existingInscription.salle && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <p className="font-medium text-green-800 dark:text-green-400">
                    Salle assignée : {existingInscription.salle.nom}
                  </p>
                  {existingInscription.salle.college && (
                    <p className="text-sm text-green-700 dark:text-green-500">
                      {existingInscription.salle.college.nom}
                    </p>
                  )}
                </div>
              )}

              {existingInscription.statut === 'EN_ATTENTE' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Votre demande est en cours d'examen par l'administration. 
                    Vous serez notifié dès qu'une décision sera prise.
                  </AlertDescription>
                </Alert>
              )}

              {existingInscription.statut === 'REFUSE' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Votre demande a été refusée. Veuillez contacter l'administration 
                    pour plus d'informations.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle demande d'inscription</CardTitle>
              <CardDescription>
                Soumettez une demande d'inscription pour l'année {anneeScolaire?.libelle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!anneeScolaire ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucune année scolaire n'est actuellement ouverte aux inscriptions.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="college">Collège souhaité</Label>
                    <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un collège" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={!selectedCollegeId || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Soumettre la demande'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
