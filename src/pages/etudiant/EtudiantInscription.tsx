import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiGet, apiPost } from '@/lib/api';
import type { College, AnneeScolaire, Inscription } from '@/types/api';
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle, GraduationCap, Building, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EtudiantInscription() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [anneeScolaire, setAnneeScolaire] = useState<AnneeScolaire | null>(null);
  const [existingInscription, setExistingInscription] = useState<Inscription | null>(null);
  const [allInscriptions, setAllInscriptions] = useState<Inscription[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [collegesRes, anneeRes, inscriptionsRes] = await Promise.all([
          apiGet<College[]>('/colleges', { requiresAuth: false }),
          apiGet<AnneeScolaire>('/annees-scolaires/active'),
          apiGet<Inscription[]>('/inscriptions'),
        ]);

        if (collegesRes.success && collegesRes.data) {
          setColleges(collegesRes.data);
        }

        if (inscriptionsRes.success && inscriptionsRes.data) {
          setAllInscriptions(inscriptionsRes.data);
        }

        if (anneeRes.success && anneeRes.data) {
          setAnneeScolaire(anneeRes.data);
          
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
        setAllInscriptions(prev => [response.data!, ...prev]);
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
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            Acceptée
          </Badge>
        );
      case 'REFUSE':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Refusée
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
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

  const pastInscriptions = allInscriptions.filter(
    i => i.anneeScolaireId !== anneeScolaire?.id
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inscription</h1>
            <p className="text-muted-foreground">
              Gérez votre inscription pour l'année scolaire en cours
            </p>
          </div>
        </div>

        {/* Current year info */}
        {anneeScolaire && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Année scolaire active</p>
                <p className="text-2xl font-bold text-primary">{anneeScolaire.libelle}</p>
                <p className="text-sm text-muted-foreground">
                  Du {new Date(anneeScolaire.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(anneeScolaire.dateFin).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing inscription or form */}
        {existingInscription ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Votre demande d'inscription
              </CardTitle>
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
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-400">
                        Inscription confirmée !
                      </p>
                      <p className="text-green-700 dark:text-green-500">
                        Salle : <span className="font-medium">{existingInscription.salle.nom}</span>
                      </p>
                      {existingInscription.salle.college && (
                        <p className="text-sm text-green-600 dark:text-green-500">
                          {existingInscription.salle.college.nom}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {existingInscription.statut === 'EN_ATTENTE' && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-400">
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
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Nouvelle demande d'inscription
              </CardTitle>
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un collège" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              {college.nom}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={!selectedCollegeId || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Soumettre la demande
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Past inscriptions */}
        {pastInscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des inscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastInscriptions.map((inscription) => (
                  <div
                    key={inscription.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{inscription.anneeScolaire?.libelle}</p>
                      {inscription.salle && (
                        <p className="text-sm text-muted-foreground">
                          {inscription.salle.nom} - {inscription.salle.college?.nom}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(inscription.statut)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
