import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Users, Mail, Phone } from 'lucide-react';
import type { Enseignant, Departement, Matiere } from '@/types/api';

interface EnseignantForm {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  datePriseFonction: string;
  indice: string;
  matiereId: string;
  departementId: string;
}

const initialForm: EnseignantForm = {
  email: '',
  password: '',
  nom: '',
  prenom: '',
  telephone: '',
  datePriseFonction: new Date().toISOString().split('T')[0],
  indice: '100',
  matiereId: '',
  departementId: '',
};

export default function AdminCollegeEnseignants() {
  const { toast } = useToast();
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EnseignantForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [enseignantsRes, departementsRes, matieresRes] = await Promise.all([
        apiGet<Enseignant[]>('/enseignants'),
        apiGet<Departement[]>('/departements'),
        apiGet<Matiere[]>('/matieres'),
      ]);
      
      if (enseignantsRes.success && enseignantsRes.data) {
        setEnseignants(enseignantsRes.data);
      }
      if (departementsRes.success && departementsRes.data) {
        setDepartements(departementsRes.data);
      }
      if (matieresRes.success && matieresRes.data) {
        setMatieres(matieresRes.data);
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

  // Filtrer les matières par département sélectionné
  const filteredMatieres = formData.departementId
    ? matieres.filter(m => m.departementId === formData.departementId)
    : matieres;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiPost<Enseignant>('/enseignants', {
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone || undefined,
        datePriseFonction: new Date(formData.datePriseFonction).toISOString(),
        indice: parseInt(formData.indice),
        matiereId: formData.matiereId || undefined,
        departementId: formData.departementId || undefined,
      });

      if (response.success) {
        toast({
          title: 'Enseignant créé',
          description: `${formData.prenom} ${formData.nom} a été ajouté comme enseignant.`,
        });
        setDialogOpen(false);
        setFormData(initialForm);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) return;

    const response = await apiDelete(`/enseignants/${id}`);
    if (response.success) {
      toast({ title: 'Enseignant supprimé' });
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
            <h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
            <p className="text-muted-foreground">Gérez les enseignants de votre collège</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setFormData(initialForm);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel enseignant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Ajouter un enseignant</DialogTitle>
                  <DialogDescription>
                    Créez un compte enseignant avec ses informations.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  {/* Informations personnelles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom *</Label>
                      <Input
                        id="prenom"
                        placeholder="Jean"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom *</Label>
                      <Input
                        id="nom"
                        placeholder="Martin"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.martin@academy.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="+221 77 123 45 67"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>

                  {/* Informations professionnelles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="datePriseFonction">Date prise de fonction *</Label>
                      <Input
                        id="datePriseFonction"
                        type="date"
                        value={formData.datePriseFonction}
                        onChange={(e) => setFormData({ ...formData, datePriseFonction: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="indice">Indice *</Label>
                      <Input
                        id="indice"
                        type="number"
                        min="1"
                        value={formData.indice}
                        onChange={(e) => setFormData({ ...formData, indice: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departement">Département</Label>
                    <Select
                      value={formData.departementId}
                      onValueChange={(value) => setFormData({ ...formData, departementId: value, matiereId: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un département" />
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

                  <div className="space-y-2">
                    <Label htmlFor="matiere">Matière principale</Label>
                    <Select
                      value={formData.matiereId}
                      onValueChange={(value) => setFormData({ ...formData, matiereId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucune</SelectItem>
                        {filteredMatieres.map((matiere) => (
                          <SelectItem key={matiere.id} value={matiere.id}>
                            {matiere.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des enseignants
            </CardTitle>
            <CardDescription>
              {enseignants.length} enseignant{enseignants.length > 1 ? 's' : ''} dans votre collège
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : enseignants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun enseignant. Ajoutez-en un pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Indice</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enseignants.map((enseignant) => (
                    <TableRow key={enseignant.id}>
                      <TableCell className="font-medium">
                        {enseignant.prenom} {enseignant.nom}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {enseignant.user?.email}
                          </div>
                          {enseignant.telephone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {enseignant.telephone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(enseignant as any).matiere?.nom ? (
                          <Badge variant="secondary">
                            {(enseignant as any).matiere.nom}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{(enseignant as any).indice || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(enseignant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
