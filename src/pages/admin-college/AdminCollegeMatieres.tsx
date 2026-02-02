import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Pencil, Trash2, BookMarked } from 'lucide-react';
import type { Matiere, Departement } from '@/types/api';

interface MatiereForm {
  nom: string;
  departementId: string;
}

const initialForm: MatiereForm = {
  nom: '',
  departementId: '',
};

export default function AdminCollegeMatieres() {
  const { toast } = useToast();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MatiereForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [matieresRes, departementsRes] = await Promise.all([
        apiGet<Matiere[]>('/matieres'),
        apiGet<Departement[]>('/departements'),
      ]);
      
      if (matieresRes.success && matieresRes.data) {
        setMatieres(matieresRes.data);
      }
      if (departementsRes.success && departementsRes.data) {
        setDepartements(departementsRes.data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = editingId
        ? await apiPatch<Matiere>(`/matieres/${editingId}`, formData)
        : await apiPost<Matiere>('/matieres', formData);

      if (response.success) {
        toast({
          title: editingId ? 'Matière modifiée' : 'Matière créée',
          description: `La matière ${formData.nom} a été ${editingId ? 'modifiée' : 'créée'}.`,
        });
        setDialogOpen(false);
        setFormData(initialForm);
        setEditingId(null);
        fetchData();
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

  const handleEdit = (matiere: Matiere) => {
    setFormData({
      nom: matiere.nom,
      departementId: matiere.departementId,
    });
    setEditingId(matiere.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;

    const response = await apiDelete(`/matieres/${id}`);
    if (response.success) {
      toast({ title: 'Matière supprimée' });
      fetchData();
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
            <h1 className="text-3xl font-bold tracking-tight">Matières</h1>
            <p className="text-muted-foreground">Gérez les matières enseignées dans votre collège</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setFormData(initialForm);
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button disabled={departements.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle matière
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Modifier' : 'Créer'} une matière</DialogTitle>
                  <DialogDescription>
                    Les matières sont rattachées à un département.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom de la matière *</Label>
                    <Input
                      id="nom"
                      placeholder="Mathématiques"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departement">Département *</Label>
                    <Select
                      value={formData.departementId}
                      onValueChange={(value) => setFormData({ ...formData, departementId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departements.map((dep) => (
                          <SelectItem key={dep.id} value={dep.id}>
                            {dep.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !formData.departementId}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? 'Modifier' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {departements.length === 0 && !loading && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Vous devez d'abord créer au moins un département avant de pouvoir ajouter des matières.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Liste des matières
            </CardTitle>
            <CardDescription>
              {matieres.length} matière{matieres.length > 1 ? 's' : ''} dans votre collège
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : matieres.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune matière. Créez-en une pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matieres.map((matiere) => (
                    <TableRow key={matiere.id}>
                      <TableCell className="font-medium">{matiere.nom}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {matiere.departement?.nom || 'Non assigné'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(matiere)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(matiere.id)}
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
