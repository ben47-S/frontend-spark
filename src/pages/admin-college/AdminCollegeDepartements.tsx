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
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Pencil, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import type { Departement } from '@/types/api';

interface DepartementForm {
  nom: string;
}

const initialForm: DepartementForm = {
  nom: '',
};

export default function AdminCollegeDepartements() {
  const { toast } = useToast();
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DepartementForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartements = async () => {
    try {
      const response = await apiGet<Departement[]>('/departements');
      if (response.success && response.data) {
        setDepartements(response.data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = editingId
        ? await apiPatch<Departement>(`/departements/${editingId}`, formData)
        : await apiPost<Departement>('/departements', formData);

      if (response.success) {
        toast({
          title: editingId ? 'Département modifié' : 'Département créé',
          description: `Le département ${formData.nom} a été ${editingId ? 'modifié' : 'créé'}.`,
        });
        setDialogOpen(false);
        setFormData(initialForm);
        setEditingId(null);
        fetchDepartements();
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

  const handleEdit = (departement: Departement) => {
    setFormData({ nom: departement.nom });
    setEditingId(departement.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return;

    const response = await apiDelete(`/departements/${id}`);
    if (response.success) {
      toast({ title: 'Département supprimé' });
      fetchDepartements();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: response.error?.message || 'Impossible de supprimer',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Départements</h1>
            <p className="text-muted-foreground">Gérez les départements de votre collège</p>
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
                Nouveau département
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Modifier' : 'Créer'} un département</DialogTitle>
                  <DialogDescription>
                    Les départements regroupent les matières et les enseignants.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du département *</Label>
                    <Input
                      id="nom"
                      placeholder="Sciences et Technologies"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
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
              <BookOpen className="h-5 w-5" />
              Liste des départements
            </CardTitle>
            <CardDescription>
              {departements.length} département{departements.length > 1 ? 's' : ''} dans votre collège
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : departements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun département. Créez-en un pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Matières</TableHead>
                    <TableHead>Enseignants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departements.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-medium">{dep.nom}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          {dep._count?.matieres || 0} matières
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {dep._count?.enseignantDepartements || 0} enseignants
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dep)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dep.id)}
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
