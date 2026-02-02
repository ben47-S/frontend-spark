import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPatch } from '@/lib/api';
import type { Inscription, Salle, ApiResponse } from '@/types/api';
import { Loader2, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function AdminInscriptions() {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE'>('EN_ATTENTE');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [dialogAction, setDialogAction] = useState<'accept' | 'refuse' | null>(null);
  const [selectedSalleId, setSelectedSalleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [inscriptionsRes, sallesRes] = await Promise.all([
          apiGet<Inscription[]>('/inscriptions'),
          apiGet<Salle[]>('/salles'),
        ]);

        if (inscriptionsRes.success && inscriptionsRes.data) {
          setInscriptions(inscriptionsRes.data);
        }

        if (sallesRes.success && sallesRes.data) {
          setSalles(sallesRes.data);
        }
      } catch (err) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les inscriptions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInscriptions = inscriptions.filter((inscription) => {
    // Filter by status
    if (filter !== 'all' && inscription.statut !== filter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentName = `${inscription.etudiant?.prenom} ${inscription.etudiant?.nom}`.toLowerCase();
      const email = inscription.etudiant?.user?.email?.toLowerCase() || '';
      return studentName.includes(query) || email.includes(query);
    }

    return true;
  });

  const handleOpenDialog = (inscription: Inscription, action: 'accept' | 'refuse') => {
    setSelectedInscription(inscription);
    setDialogAction(action);
    setSelectedSalleId('');
  };

  const handleCloseDialog = () => {
    setSelectedInscription(null);
    setDialogAction(null);
    setSelectedSalleId('');
  };

  const handleSubmitResponse = async () => {
    if (!selectedInscription || !dialogAction) return;

    if (dialogAction === 'accept' && !selectedSalleId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une salle',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiPatch<Inscription>(
        `/inscriptions/${selectedInscription.id}/reponse`,
        {
          statut: dialogAction === 'accept' ? 'ACCEPTE' : 'REFUSE',
          ...(dialogAction === 'accept' && { salleId: selectedSalleId }),
        }
      );

      if (response.success && response.data) {
        // Update local state
        setInscriptions((prev) =>
          prev.map((i) => (i.id === selectedInscription.id ? { ...i, ...response.data } : i))
        );

        toast({
          title: 'Succès',
          description: dialogAction === 'accept' 
            ? 'Inscription acceptée avec succès' 
            : 'Inscription refusée',
        });

        handleCloseDialog();
      } else {
        toast({
          title: 'Erreur',
          description: response.error?.message || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'ACCEPTE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Acceptée</Badge>;
      case 'REFUSE':
        return <Badge variant="destructive">Refusée</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">En attente</Badge>;
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

  const pendingCount = inscriptions.filter((i) => i.statut === 'EN_ATTENTE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
            <p className="text-muted-foreground">
              Gérez les demandes d'inscription des étudiants
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {pendingCount} en attente
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'EN_ATTENTE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('EN_ATTENTE')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  En attente
                </Button>
                <Button
                  variant={filter === 'ACCEPTE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('ACCEPTE')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Acceptées
                </Button>
                <Button
                  variant={filter === 'REFUSE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('REFUSE')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Refusées
                </Button>
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Toutes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des inscriptions</CardTitle>
            <CardDescription>
              {filteredInscriptions.length} inscription(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium">Aucune inscription trouvée</p>
                <p className="text-sm text-muted-foreground">
                  {filter === 'EN_ATTENTE'
                    ? 'Il n\'y a pas de demandes en attente'
                    : 'Aucune inscription ne correspond à vos critères'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Année scolaire</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Salle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInscriptions.map((inscription) => (
                    <TableRow key={inscription.id}>
                      <TableCell className="font-medium">
                        {inscription.etudiant?.prenom} {inscription.etudiant?.nom}
                      </TableCell>
                      <TableCell>{inscription.etudiant?.user?.email}</TableCell>
                      <TableCell>{inscription.anneeScolaire?.libelle}</TableCell>
                      <TableCell>
                        {new Date(inscription.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(inscription.statut)}</TableCell>
                      <TableCell>{inscription.salle?.nom || '-'}</TableCell>
                      <TableCell className="text-right">
                        {inscription.statut === 'EN_ATTENTE' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleOpenDialog(inscription, 'accept')}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleOpenDialog(inscription, 'refuse')}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Refuser
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Response Dialog */}
      <Dialog open={!!selectedInscription && !!dialogAction} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'accept' ? 'Accepter l\'inscription' : 'Refuser l\'inscription'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'accept'
                ? 'Sélectionnez une salle pour cet étudiant'
                : 'Êtes-vous sûr de vouloir refuser cette inscription ?'}
            </DialogDescription>
          </DialogHeader>

          {selectedInscription && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  {selectedInscription.etudiant?.prenom} {selectedInscription.etudiant?.nom}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInscription.etudiant?.user?.email}
                </p>
              </div>

              {dialogAction === 'accept' && (
                <div className="space-y-2">
                  <Label htmlFor="salle">Salle assignée</Label>
                  <Select value={selectedSalleId} onValueChange={setSelectedSalleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {salles.map((salle) => (
                        <SelectItem key={salle.id} value={salle.id}>
                          {salle.nom} {salle.capacite && `(${salle.capacite} places)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              variant={dialogAction === 'refuse' ? 'destructive' : 'default'}
              onClick={handleSubmitResponse}
              disabled={isSubmitting || (dialogAction === 'accept' && !selectedSalleId)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : dialogAction === 'accept' ? (
                'Accepter'
              ) : (
                'Refuser'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
