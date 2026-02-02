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
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Pencil, Trash2, Home, Users } from 'lucide-react';
import type { Salle, Departement } from '@/types/api';

interface SalleForm {
  numero: string;
  nbPlaces: string;
  departementId: string;
}

const initialForm: SalleForm = {
  numero: '',
  nbPlaces: '',
  departementId: '',
};

interface AdminCollegeProfil {
  id: string;
  collegeId: string;
}

export default function AdminCollegeSalles() {
  const { toast } = useToast();
  const [salles, setSalles] = useState<Salle[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SalleForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  const fetchAdminProfil = async () => {
    try {
      const response = await apiGet<AdminCollegeProfil>('/admin-college/me');
      if (response.success && response.data) {
        setCollegeId(response.data.collegeId);
        return response.data.collegeId;
      }
    } catch (err) {
      console.error('Erreur récupération profil admin:', err);
    }
    return null;
  };

  const fetchData = async () => {
    try {
      const [sallesRes, departementsRes] = await Promise.all([
        apiGet<Salle[]>('/salles'),
        apiGet<Departement[]>('/departements'),
      ]);
      
      if (sallesRes.success && sallesRes.data) {
        setSalles(sallesRes.data);
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
    const init = async () => {
      await fetchAdminProfil();
      await fetchData();
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!collegeId) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de récupérer votre collège',
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        numero: formData.numero,
        nbPlaces: parseInt(formData.nbPlaces),
        collegeId,
        departementId: formData.departementId || undefined,
      };

      const response = editingId
        ? await apiPatch<Salle>(`/salles/${editingId}`, payload)
        : await apiPost<Salle>('/salles', payload);

      if (response.success) {
        toast({
          title: editingId ? 'Salle modifiée' : 'Salle créée',
          description: `La salle ${formData.numero} a été ${editingId ? 'modifiée' : 'créée'}.`,
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

  const handleEdit = (salle: Salle) => {
    setFormData({
      numero: salle.numero,
      nbPlaces: String(salle.nbPlaces || ''),
      departementId: salle.departementId || '',
    });
    setEditingId(salle.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

    const response = await apiDelete(`/salles/${id}`);
    if (response.success) {
      toast({ title: 'Salle supprimée' });
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
            <h1 className="text-3xl font-bold tracking-tight">Salles</h1>
            <p className="text-muted-foreground">Gérez les salles de votre collège</p>
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
                Nouvelle salle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Modifier' : 'Créer'} une salle</DialogTitle>
                  <DialogDescription>
                    Définissez le numéro et la capacité de la salle.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Numéro de salle *</Label>
                    <Input
                      id="numero"
                      placeholder="A101"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nbPlaces">Nombre de places *</Label>
                    <Input
                      id="nbPlaces"
                      type="number"
                      min="1"
                      placeholder="30"
                      value={formData.nbPlaces}
                      onChange={(e) => setFormData({ ...formData, nbPlaces: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departement">Département (optionnel)</Label>
                    <Select
                      value={formData.departementId}
                      onValueChange={(value) => setFormData({ ...formData, departementId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Aucun département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
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
              <Home className="h-5 w-5" />
              Liste des salles
            </CardTitle>
            <CardDescription>
              {salles.length} salle{salles.length > 1 ? 's' : ''} dans votre collège
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : salles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune salle. Créez-en une pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salles.map((salle) => (
                    <TableRow key={salle.id}>
                      <TableCell className="font-medium">{salle.numero}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {salle.nbPlaces} places
                        </span>
                      </TableCell>
                      <TableCell>
                        {salle.departement?.nom || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(salle)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(salle.id)}
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
