import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiGet } from '@/lib/api';
import type { EnseignantMeResponse, EnseignantDemande } from '@/types/api';
import { 
  BookOpen, 
  Users, 
  Building, 
  Calendar,
  Loader2,
  AlertCircle,
  Bell,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EnseignantDashboard() {
  const [data, setData] = useState<EnseignantMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<EnseignantMeResponse>('/enseignants/me');
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error?.message || 'Erreur lors du chargement');
        }
      } catch {
        setError('Erreur de connexion au serveur');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const { enseignant, affectations, demandesEnAttente } = data!;
  const affectationsActives = affectations.filter(a => a.anneeScolaire?.estActive);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {enseignant.prenom} {enseignant.nom}
          </h1>
          <p className="text-muted-foreground">
            {enseignant.matiere ? `Enseignant de ${enseignant.matiere.nom}` : 'Enseignant'}
          </p>
        </div>

        {/* Demandes en attente - Alert prioritaire */}
        {demandesEnAttente.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <Bell className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-yellow-800 dark:text-yellow-400">
                Vous avez {demandesEnAttente.length} demande{demandesEnAttente.length > 1 ? 's' : ''} d'assignation en attente
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/enseignant/demandes">Voir les demandes</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Départements</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affectationsActives.length}</div>
              <p className="text-xs text-muted-foreground">
                Affectation{affectationsActives.length > 1 ? 's' : ''} active{affectationsActives.length > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matière</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enseignant.matiere?.nom || '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {enseignant.matiere ? 'Matière assignée' : 'Non assignée'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demandesEnAttente.length}</div>
              <p className="text-xs text-muted-foreground">En attente de réponse</p>
            </CardContent>
          </Card>
        </div>

        {/* Affectations actuelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Mes affectations
            </CardTitle>
            <CardDescription>
              Départements où vous êtes assigné cette année
            </CardDescription>
          </CardHeader>
          <CardContent>
            {affectationsActives.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Building className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>Aucune affectation active pour le moment</p>
                <p className="text-sm">Attendez qu'un administrateur vous assigne à un département</p>
              </div>
            ) : (
              <div className="space-y-4">
                {affectationsActives.map((affectation) => (
                  <div 
                    key={affectation.id} 
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{affectation.departement?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {affectation.departement?.college?.nom}
                      </p>
                    </div>
                    <div className="text-right">
                      {affectation.estResponsable && (
                        <Badge variant="secondary">Responsable</Badge>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {affectation.anneeScolaire?.libelle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demandes en attente - Liste détaillée */}
        {demandesEnAttente.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Demandes d'assignation
              </CardTitle>
              <CardDescription>
                Répondez aux demandes d'assignation des administrateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demandesEnAttente.slice(0, 3).map((demande) => (
                  <div
                    key={demande.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{demande.departement?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {demande.departement?.college?.nom} • {demande.anneeScolaire?.libelle}
                      </p>
                    </div>
                    {getStatusBadge(demande.statut)}
                  </div>
                ))}
              </div>
              {demandesEnAttente.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/enseignant/demandes">
                      Voir toutes les demandes ({demandesEnAttente.length})
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link to="/enseignant/demandes">
                <Bell className="mr-2 h-4 w-4" />
                Mes demandes
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/enseignant/notes">
                <BookOpen className="mr-2 h-4 w-4" />
                Saisir les notes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
