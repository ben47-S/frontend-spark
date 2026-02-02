import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Mail, Phone, GraduationCap, AlertCircle } from 'lucide-react';
import { apiGet } from '@/lib/api';
import type { Salle, Etudiant, AnneeScolaire } from '@/types/api';

interface InscriptionWithDetails {
  id: string;
  etudiant: Etudiant & { user?: { email: string } };
  salle: Salle;
  anneeScolaire: AnneeScolaire;
}

export default function EnseignantEtudiants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSalle, setFilterSalle] = useState('all');

  // Récupérer les salles de l'enseignant
  const { data: sallesData, isLoading: sallesLoading } = useQuery({
    queryKey: ['enseignant-salles'],
    queryFn: async () => {
      const response = await apiGet<Salle[]>('/salles');
      return response.data || [];
    },
  });

  // Récupérer les inscriptions (étudiants dans les salles)
  const { data: inscriptionsData, isLoading: inscriptionsLoading } = useQuery({
    queryKey: ['enseignant-inscriptions'],
    queryFn: async () => {
      const response = await apiGet<InscriptionWithDetails[]>('/inscriptions?statut=ACCEPTE');
      return response.data || [];
    },
  });

  const salles = sallesData || [];
  const inscriptions = inscriptionsData || [];

  // Transformer les inscriptions en liste d'étudiants
  const etudiants = inscriptions
    .filter(insc => insc.etudiant && insc.salle)
    .map(insc => ({
      id: insc.etudiant!.id,
      nom: insc.etudiant!.nom,
      prenom: insc.etudiant!.prenom,
      email: insc.etudiant!.user?.email || '',
      telephone: insc.etudiant!.telephone,
      salleId: insc.salle!.id,
      salle: { id: insc.salle!.id, numero: insc.salle!.numero },
      anneeScolaire: insc.anneeScolaire?.libelle || '',
    }));

  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (etudiant.email && etudiant.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSalle = filterSalle === 'all' || etudiant.salleId === filterSalle;
    return matchesSearch && matchesSalle;
  });

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase();
  };

  // Stats par salle
  const statsBySalle = salles.map(salle => {
    const etudiantsSalle = etudiants.filter(e => e.salleId === salle.id);
    return {
      ...salle,
      nbEtudiants: etudiantsSalle.length,
    };
  });

  const isLoading = sallesLoading || inscriptionsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Étudiants par salle</h1>
          <p className="text-muted-foreground">
            Consultez la liste des étudiants inscrits dans chaque salle
          </p>
        </div>

        {/* Stats par salle */}
        {statsBySalle.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statsBySalle.map((salle) => (
              <Card 
                key={salle.id} 
                className={`cursor-pointer transition-colors hover:border-primary ${filterSalle === salle.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setFilterSalle(filterSalle === salle.id ? 'all' : salle.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Salle {salle.numero}</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salle.nbEtudiants}</div>
                  <p className="text-xs text-muted-foreground">
                    étudiant{salle.nbEtudiants > 1 ? 's' : ''} inscrit{salle.nbEtudiants > 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">Aucune salle disponible</p>
            </CardContent>
          </Card>
        )}

        {/* Filtres */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterSalle} onValueChange={setFilterSalle}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer par salle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les salles</SelectItem>
              {salles.map(salle => (
                <SelectItem key={salle.id} value={salle.id}>Salle {salle.numero}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tableau des étudiants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des étudiants
            </CardTitle>
            <CardDescription>
              {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''} trouvé{filteredEtudiants.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEtudiants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 opacity-50" />
                <p className="mt-4">Aucun étudiant trouvé</p>
                <p className="text-sm">
                  {etudiants.length === 0 
                    ? "Aucun étudiant n'est inscrit dans les salles" 
                    : "Essayez de modifier vos filtres"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Salle</TableHead>
                    <TableHead>Année scolaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEtudiants.map((etudiant) => (
                    <TableRow key={etudiant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(etudiant.prenom, etudiant.nom)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {etudiant.prenom} {etudiant.nom}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {etudiant.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{etudiant.email}</span>
                            </div>
                          )}
                          {etudiant.telephone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{etudiant.telephone}</span>
                            </div>
                          )}
                          {!etudiant.email && !etudiant.telephone && (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Salle {etudiant.salle.numero}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {etudiant.anneeScolaire || '-'}
                        </span>
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
