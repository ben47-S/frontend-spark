import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Pencil, Trash2, Calendar, CheckCircle, DoorOpen, DoorClosed } from 'lucide-react';
import type { AnneeScolaire } from '@/types/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnneeScolaireForm {
  libelle: string;
  dateDebut: string;
  dateFin: string;
  dateOuvertureInscriptions: string;
  dateFermetureInscriptions: string;
}

const initialForm: AnneeScolaireForm = {
  libelle: '',
  dateDebut: '',
  dateFin: '',
  dateOuvertureInscriptions: '',
  dateFermetureInscriptions: '',
};

export default function AdminAnneesScolaires() {
  const { toast } = useToast();
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AnneeScolaireForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnees = async () => {
    try {
      const response = await apiGet<AnneeScolaire[]>('/annees');
      if (response.success && response.data) {
        setAnnees(response.data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const libelle = `${new Date(formData.dateDebut).getFullYear()}-${new Date(formData.dateFin).getFullYear()}`;
      const payload = {
        libelle,
        dateDebut: new Date(formData.dateDebut).toISOString(),
        dateFin: new Date(formData.dateFin).toISOString(),
        dateOuvertureInscriptions: new Date(formData.dateOuvertureInscriptions).toISOString(),
        dateFermetureInscriptions: new Date(formData.dateFermetureInscriptions).toISOString(),
      };

      const response = editingId
        ? await apiPatch<AnneeScolaire>(`/annees/${editingId}`, payload)
        : await apiPost<AnneeScolaire>('/annees', payload);

      if (response.success) {
        toast({
          title: editingId ? 'Année modifiée' : 'Année créée',
          description: `L'année scolaire ${formData.libelle} a été ${editingId ? 'modifiée' : 'créée'}.`,
        });
        setDialogOpen(false);
        setFormData(initialForm);
        setEditingId(null);
        fetchAnnees();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: response.error?.message || 'Une erreur est survenue',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (annee: AnneeScolaire) => {
    setFormData({
      libelle: annee.libelle,
      dateDebut: annee.dateDebut.split('T')[0],
      dateFin: annee.dateFin.split('T')[0],
      dateOuvertureInscriptions: annee.dateOuvertureInscriptions?.split('T')[0] || '',
      dateFermetureInscriptions: annee.dateFermetureInscriptions?.split('T')[0] || '',
    });
    setEditingId(annee.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette année scolaire ?')) return;

    const response = await apiDelete(`/annees/${id}`);
    if (response.success) {
      toast({ title: 'Année supprimée' });
      fetchAnnees();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: response.error?.message || 'Impossible de supprimer',
      });
    }
  };

  const handleActivate = async (id: string) => {
    const response = await apiPatch(`/annees/${id}/activate`);
    if (response.success) {
      toast({ title: 'Année activée', description: 'Cette année est maintenant l\'année scolaire active.' });
      fetchAnnees();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: response.error?.message,
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const isInscriptionOuverte = (annee: AnneeScolaire): boolean => {
    if (!annee.dateOuvertureInscriptions || !annee.dateFermetureInscriptions) {
      return false;
    }
    const now = new Date();
    const ouverture = new Date(annee.dateOuvertureInscriptions);
    const fermeture = new Date(annee.dateFermetureInscriptions);
    return now >= ouverture && now <= fermeture;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Années Scolaires</h1>
            <p className="text-muted-foreground">Gérez les années scolaires du système</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setFormData(initialForm);
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle année
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Modifier' : 'Créer'} une année scolaire</DialogTitle>
                  <DialogDescription>
                    Définissez les dates de l'année scolaire et la période d'inscription.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="libelle">Libellé (généré automatiquement)</Label>
                    <Input
                      id="libelle"
                      placeholder="Sélectionnez les dates"
                      value={formData.dateDebut && formData.dateFin 
                        ? `${new Date(formData.dateDebut).getFullYear()}-${new Date(formData.dateFin).getFullYear()}`
                        : ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateDebut">Date début</Label>
                      <Input
                        id="dateDebut"
                        type="date"
                        value={formData.dateDebut}
                        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFin">Date fin</Label>
                      <Input
                        id="dateFin"
                        type="date"
                        value={formData.dateFin}
                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOuvertureInscriptions">Ouverture inscriptions</Label>
                      <Input
                        id="dateOuvertureInscriptions"
                        type="date"
                        value={formData.dateOuvertureInscriptions}
                        onChange={(e) => setFormData({ ...formData, dateOuvertureInscriptions: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFermetureInscriptions">Fermeture inscriptions</Label>
                      <Input
                        id="dateFermetureInscriptions"
                        type="date"
                        value={formData.dateFermetureInscriptions}
                        onChange={(e) => setFormData({ ...formData, dateFermetureInscriptions: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? 'Modifier' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Liste des années scolaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : annees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune année scolaire. Créez-en une pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Inscriptions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {annees.map((annee) => (
                    <TableRow key={annee.id}>
                      <TableCell className="font-medium">{annee.libelle}</TableCell>
                      <TableCell>
                        {formatDate(annee.dateDebut)} - {formatDate(annee.dateFin)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {annee.dateOuvertureInscriptions && (
                            <span className="text-sm text-muted-foreground block">
                              {formatDate(annee.dateOuvertureInscriptions)} - {formatDate(annee.dateFermetureInscriptions!)}
                            </span>
                          )}
                          {isInscriptionOuverte(annee) ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              <DoorOpen className="mr-1 h-3 w-3" />
                              Ouvertes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              <DoorClosed className="mr-1 h-3 w-3" />
                              Fermées
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                      {annee.estActive ? (
                          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!annee.estActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(annee.id)}
                            >
                              Activer
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(annee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(annee.id)}
                            disabled={annee.estActive}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
