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
import { Loader2, Plus, Pencil, Trash2, Building2, Users, Globe, MapPin } from 'lucide-react';
import type { College } from '@/types/api';

interface CollegeForm {
  nom: string;
  siteWeb: string;
  adresse: string;
  // Admin du collège
  adminEmail: string;
  adminPassword: string;
  adminNom: string;
  adminPrenom: string;
}

const initialForm: CollegeForm = {
  nom: '',
  siteWeb: '',
  adresse: '',
  adminEmail: '',
  adminPassword: '',
  adminNom: '',
  adminPrenom: '',
};

export default function AdminColleges() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CollegeForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchColleges = async () => {
    try {
      const response = await apiGet<College[]>('/colleges');
      if (response.success && response.data) {
        setColleges(response.data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      
      if (editingId) {
        // Modification: juste les infos du collège
        response = await apiPatch<College>(`/colleges/${editingId}`, {
          nom: formData.nom,
          siteWeb: formData.siteWeb || undefined,
          adresse: formData.adresse || undefined,
        });
      } else {
        // Création: collège + admin
        response = await apiPost<College>('/colleges', {
          nom: formData.nom,
          siteWeb: formData.siteWeb || undefined,
          adresse: formData.adresse || undefined,
          admin: {
            email: formData.adminEmail,
            password: formData.adminPassword,
            nom: formData.adminNom,
            prenom: formData.adminPrenom,
          },
        });
      }

      if (response.success) {
        toast({
          title: editingId ? 'Collège modifié' : 'Collège créé',
          description: editingId 
            ? `Le collège ${formData.nom} a été modifié.`
            : `Le collège ${formData.nom} a été créé avec son administrateur.`,
        });
        setDialogOpen(false);
        setFormData(initialForm);
        setEditingId(null);
        fetchColleges();
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

  const handleEdit = (college: College) => {
    setFormData({
      nom: college.nom,
      siteWeb: college.siteWeb || '',
      adresse: college.adresse || '',
      adminEmail: '',
      adminPassword: '',
      adminNom: '',
      adminPrenom: '',
    });
    setEditingId(college.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce collège ? Cette action est irréversible.')) return;

    const response = await apiDelete(`/colleges/${id}`);
    if (response.success) {
      toast({ title: 'Collège supprimé' });
      fetchColleges();
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
            <h1 className="text-3xl font-bold tracking-tight">Collèges</h1>
            <p className="text-muted-foreground">Gérez les établissements du réseau UICI</p>
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
                Nouveau collège
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Modifier' : 'Créer'} un collège</DialogTitle>
                  <DialogDescription>
                    {editingId 
                      ? 'Modifiez les informations du collège.'
                      : 'Créez un nouveau collège avec son administrateur.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  {/* Informations du collège */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Informations du collège
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom du collège *</Label>
                      <Input
                        id="nom"
                        placeholder="Collège Einstein"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <Input
                        id="adresse"
                        placeholder="123 Rue de l'Éducation, Dakar"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteWeb">Site web</Label>
                      <Input
                        id="siteWeb"
                        placeholder="https://college-einstein.sn"
                        value={formData.siteWeb}
                        onChange={(e) => setFormData({ ...formData, siteWeb: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Admin du collège - seulement en création */}
                  {!editingId && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Administrateur du collège
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adminPrenom">Prénom *</Label>
                          <Input
                            id="adminPrenom"
                            placeholder="Marie"
                            value={formData.adminPrenom}
                            onChange={(e) => setFormData({ ...formData, adminPrenom: e.target.value })}
                            required={!editingId}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adminNom">Nom *</Label>
                          <Input
                            id="adminNom"
                            placeholder="Dupont"
                            value={formData.adminNom}
                            onChange={(e) => setFormData({ ...formData, adminNom: e.target.value })}
                            required={!editingId}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email *</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          placeholder="admin@college-einstein.sn"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          required={!editingId}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword">Mot de passe *</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          required={!editingId}
                        />
                      </div>
                    </div>
                  )}
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
              <Building2 className="h-5 w-5" />
              Liste des collèges
            </CardTitle>
            <CardDescription>
              {colleges.length} collège{colleges.length > 1 ? 's' : ''} dans le réseau
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : colleges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun collège. Créez-en un pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Site web</TableHead>
                    <TableHead>Statistiques</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell className="font-medium">{college.nom}</TableCell>
                      <TableCell>
                        {college.adresse ? (
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {college.adresse}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {college.siteWeb ? (
                          <a 
                            href={college.siteWeb} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            Visiter
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {college._count && (
                            <>
                              <Badge variant="secondary">
                                {college._count.departements} dép.
                              </Badge>
                              <Badge variant="secondary">
                                {college._count.salles} salles
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(college)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(college.id)}
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
