import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiGet, apiPatch } from '@/lib/api';
import type { EnseignantDemande } from '@/types/api';
import { 
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Calendar,
  Bell
} from 'lucide-react';

export default function EnseignantDemandes() {
  const [demandes, setDemandes] = useState<EnseignantDemande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    demandeId: string;
    action: 'ACCEPTE' | 'REFUSE';
    departementNom: string;
  } | null>(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet<EnseignantDemande[]>('/enseignants/me/demandes');
      if (response.success && response.data) {
        setDemandes(response.data);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (demandeId: string, statut: 'ACCEPTE' | 'REFUSE') => {
    setProcessingId(demandeId);
    setConfirmDialog(null);

    try {
      const response = await apiPatch(`/enseignants/me/demandes/${demandeId}`, { statut });
      if (response.success) {
        // Mettre à jour la liste localement
        setDemandes(prev => prev.map(d => 
          d.id === demandeId 
            ? { ...d, statut, dateReponse: new Date().toISOString() }
            : d
        ));
      } else {
        setError(response.error?.message || 'Erreur lors de la réponse');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setProcessingId(null);
    }
  };

  const openConfirmDialog = (demande: EnseignantDemande, action: 'ACCEPTE' | 'REFUSE') => {
    setConfirmDialog({
      open: true,
      demandeId: demande.id,
      action,
      departementNom: demande.departement?.nom || 'ce département',
    });
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

  const demandesEnAttente = demandes.filter(d => d.statut === 'EN_ATTENTE');
  const demandesTraitees = demandes.filter(d => d.statut !== 'EN_ATTENTE');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Demandes d'assignation</h1>
            <p className="text-muted-foreground">
              Gérez les demandes d'affectation à des départements
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Demandes en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              En attente de réponse
              {demandesEnAttente.length > 0 && (
                <Badge variant="secondary">{demandesEnAttente.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Répondez aux demandes pour être assigné aux départements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {demandesEnAttente.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandesEnAttente.map((demande) => (
                  <div
                    key={demande.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{demande.departement?.nom}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {demande.departement?.college?.nom}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{demande.anneeScolaire?.libelle}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Reçue le {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfirmDialog(demande, 'REFUSE')}
                          disabled={processingId === demande.id}
                        >
                          {processingId === demande.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="mr-1 h-4 w-4" />
                              Refuser
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openConfirmDialog(demande, 'ACCEPTE')}
                          disabled={processingId === demande.id}
                        >
                          {processingId === demande.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Accepter
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historique */}
        {demandesTraitees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
              <CardDescription>
                Demandes auxquelles vous avez déjà répondu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demandesTraitees.map((demande) => (
                  <div
                    key={demande.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{demande.departement?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {demande.departement?.college?.nom} • {demande.anneeScolaire?.libelle}
                      </p>
                      {demande.dateReponse && (
                        <p className="text-xs text-muted-foreground">
                          Répondu le {new Date(demande.dateReponse).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(demande.statut)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog 
          open={confirmDialog?.open} 
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog?.action === 'ACCEPTE' ? 'Accepter' : 'Refuser'} la demande ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog?.action === 'ACCEPTE' 
                  ? `Vous serez assigné au département "${confirmDialog?.departementNom}" pour l'année scolaire en cours.`
                  : `Vous ne serez pas assigné au département "${confirmDialog?.departementNom}". Cette action est définitive.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDialog && handleResponse(confirmDialog.demandeId, confirmDialog.action)}
                className={confirmDialog?.action === 'REFUSE' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {confirmDialog?.action === 'ACCEPTE' ? 'Accepter' : 'Refuser'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
