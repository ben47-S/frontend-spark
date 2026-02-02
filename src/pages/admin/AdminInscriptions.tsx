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
import type { Inscription, Salle, AnneeScolaire } from '@/types/api';
import { Loader2, CheckCircle, XCircle, Clock, Search, Users, CalendarDays, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function AdminInscriptions() {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [anneeScolaire, setAnneeScolaire] = useState<AnneeScolaire | null>(null);
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
        const [inscriptionsRes, sallesRes, anneeRes] = await Promise.all([
          apiGet<Inscription[]>('/inscriptions'),
          apiGet<Salle[]>('/salles'),
          apiGet<AnneeScolaire>('/annees-scolaires/active'),
        ]);

        if (inscriptionsRes.success && inscriptionsRes.data) {
          setInscriptions(inscriptionsRes.data);
        }

        if (sallesRes.success && sallesRes.data) {
          setSalles(sallesRes.data);
        }

        if (anneeRes.success && anneeRes.data) {
          setAnneeScolaire(anneeRes.data);
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
    // Only show current year inscriptions
    if (anneeScolaire && inscription.anneeScolaireId !== anneeScolaire.id) return false;
    
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

  const pendingCount = filteredInscriptions.filter((i) => i.statut === 'EN_ATTENTE').length;
  const acceptedCount = filteredInscriptions.filter((i) => i.statut === 'ACCEPTE').length;
  const refusedCount = filteredInscriptions.filter((i) => i.statut === 'REFUSE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
            <p className="text-muted-foreground">
              Gérez les demandes d'inscription des étudiants
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/20">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Année active</p>
                <p className="text-lg font-bold">{anneeScolaire?.libelle || '-'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acceptées</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/20">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refusées</p>
                <p className="text-2xl font-bold text-destructive">{refusedCount}</p>
              </div>
            </CardContent>
          </Card>
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'EN_ATTENTE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('EN_ATTENTE')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  En attente ({pendingCount})
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
            <CardTitle>Liste des demandes</CardTitle>
            <CardDescription>
              {filteredInscriptions.length} demande(s) pour l'année {anneeScolaire?.libelle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium">Aucune demande trouvée</p>
                <p className="text-sm text-muted-foreground">
                  {filter === 'EN_ATTENTE'
                    ? 'Toutes les demandes ont été traitées'
                    : 'Aucune demande ne correspond à vos critères'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date demande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInscriptions.map((inscription) => (
                      <TableRow key={inscription.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                              {inscription.etudiant?.prenom?.[0]}{inscription.etudiant?.nom?.[0]}
                            </div>
                            <span className="font-medium">
                              {inscription.etudiant?.prenom} {inscription.etudiant?.nom}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {inscription.etudiant?.user?.email}
                        </TableCell>
                        <TableCell>
                          {new Date(inscription.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{getStatusBadge(inscription.statut)}</TableCell>
                        <TableCell>
                          {inscription.salle ? (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              {inscription.salle.nom}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {inscription.statut === 'EN_ATTENTE' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20"
                                onClick={() => handleOpenDialog(inscription, 'accept')}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive/50 text-destructive hover:bg-destructive/10"
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
              </div>
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
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {selectedInscription.etudiant?.prenom?.[0]}{selectedInscription.etudiant?.nom?.[0]}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedInscription.etudiant?.prenom} {selectedInscription.etudiant?.nom}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInscription.etudiant?.user?.email}
                  </p>
                </div>
              </div>

              {dialogAction === 'accept' && (
                <div className="space-y-2">
                  <Label htmlFor="salle">Salle assignée *</Label>
                  <Select value={selectedSalleId} onValueChange={setSelectedSalleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {salles.map((salle) => (
                        <SelectItem key={salle.id} value={salle.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {salle.nom}
                            {salle.capacite && (
                              <span className="text-muted-foreground">({salle.capacite} places)</span>
                            )}
                          </div>
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
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer l'acceptation
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirmer le refus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
