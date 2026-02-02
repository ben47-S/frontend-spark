import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2,
  Calendar,
  Home,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { College, Salle, AnneeScolaire } from '@/types/api';

interface InscriptionDetails {
  id: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  createdAt: string;
  updatedAt?: string;
  college?: College;
  salle?: Salle;
  anneeScolaire?: AnneeScolaire;
}

const notes = [
  { matiere: 'Algèbre', note: 15.5, coefficient: 2, date: '15/01/2025' },
  { matiere: 'Géométrie', note: 14.0, coefficient: 1.5, date: '20/01/2025' },
  { matiere: 'Analyse', note: 16.5, coefficient: 2.5, date: '22/01/2025' },
];

export default function EtudiantDashboard() {
  const { user } = useAuth();

  // Récupérer l'inscription de l'étudiant
  const { data: inscription, isLoading } = useQuery({
    queryKey: ['etudiant-inscription-details'],
    queryFn: async () => {
      const response = await apiGet<InscriptionDetails[]>('/inscriptions/me');
      if (response.success && response.data && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    },
  });

  // Calcul de la moyenne pondérée
  const totalPoints = notes.reduce((acc, n) => acc + n.note * n.coefficient, 0);
  const totalCoef = notes.reduce((acc, n) => acc + n.coefficient, 0);
  const moyenne = (totalPoints / totalCoef).toFixed(2);

  const isAccepted = inscription?.statut === 'ACCEPTE';
  const isPending = inscription?.statut === 'EN_ATTENTE';
  const isRefused = inscription?.statut === 'REFUSE';

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'ACCEPTE':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Acceptée
          </Badge>
        );
      case 'REFUSE':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            Refusée
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon espace étudiant</h1>
          <p className="text-muted-foreground">
            {isAccepted && inscription?.anneeScolaire 
              ? `Année scolaire ${inscription.anneeScolaire.libelle} • ${inscription.salle ? `Salle ${inscription.salle.numero}` : ''} • ${inscription.college?.nom || ''}`
              : 'Bienvenue sur votre espace personnel'
            }
          </p>
        </div>

        {/* Carte d'inscription - Affichée si inscription en cours ou refusée */}
        {inscription && (isPending || isRefused) && (
          <Card className={cn(
            'border-2',
            isPending && 'border-yellow-300 bg-yellow-50/50 dark:border-yellow-700 dark:bg-yellow-900/10',
            isRefused && 'border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10'
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Demande d'inscription
                </CardTitle>
                {getStatusBadge(inscription.statut)}
              </div>
              <CardDescription>
                Détails de votre demande d'inscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* École */}
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">École</p>
                    <p className="font-semibold">{inscription.college?.nom || 'Non spécifié'}</p>
                  </div>
                </div>

                {/* Année scolaire */}
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Année scolaire</p>
                    <p className="font-semibold">{inscription.anneeScolaire?.libelle || 'Non spécifié'}</p>
                  </div>
                </div>

                {/* Date de demande */}
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de demande</p>
                    <p className="font-semibold">{formatDate(inscription.createdAt)}</p>
                  </div>
                </div>

                {/* Date de réponse (si refusée) */}
                {isRefused && inscription.updatedAt && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de réponse</p>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatDate(inscription.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isPending && (
                <div className="mt-4 rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <Clock className="mr-2 inline h-4 w-4" />
                    Votre demande est en cours de traitement. Vous serez notifié dès qu'une décision sera prise.
                  </p>
                </div>
              )}

              {isRefused && (
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/etudiant/inscription">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Faire une nouvelle demande
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Carte d'inscription acceptée */}
        {isAccepted && inscription && (
          <Card className="border-2 border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Inscription confirmée
                </CardTitle>
                {getStatusBadge(inscription.statut)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">École</p>
                    <p className="font-semibold">{inscription.college?.nom}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Home className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Salle</p>
                    <p className="font-semibold">{inscription.salle?.numero || 'Non assignée'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Année scolaire</p>
                    <p className="font-semibold">{inscription.anneeScolaire?.libelle}</p>
                  </div>
                </div>

                {inscription.updatedAt && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Acceptée le</p>
                      <p className="font-semibold">{formatDate(inscription.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Affiché uniquement si inscrit */}
        {isAccepted && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moyenne}/20</div>
                <p className="text-xs text-muted-foreground">
                  Sur {notes.length} matières
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meilleure note</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">16.5/20</div>
                <p className="text-xs text-muted-foreground">Analyse</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statut</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600">Inscrit</div>
                <p className="text-xs text-muted-foreground">{inscription?.anneeScolaire?.libelle}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes récentes - Affiché uniquement si inscrit */}
        {isAccepted && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes notes</CardTitle>
                <CardDescription>
                  Notes de l'année scolaire en cours
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/etudiant/notes">Voir tout</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.matiere} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{note.matiere}</p>
                      <p className="text-sm text-muted-foreground">
                        Coefficient {note.coefficient} • {note.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${note.note >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {note.note}/20
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action rapide - Inscription si pas encore inscrit */}
        {!inscription && (
          <Card>
            <CardHeader>
              <CardTitle>Commencer</CardTitle>
              <CardDescription>
                Vous n'avez pas encore fait de demande d'inscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/etudiant/inscription">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Faire une demande d'inscription
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions rapides pour étudiants inscrits */}
        {isAccepted && (
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <Link to="/etudiant/notes">
                  <FileText className="mr-2 h-4 w-4" />
                  Consulter mes notes
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/etudiant/ecole">
                  <Building2 className="mr-2 h-4 w-4" />
                  Mon école
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/etudiant/classe">
                  <Users className="mr-2 h-4 w-4" />
                  Ma classe
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

// Helper cn function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
