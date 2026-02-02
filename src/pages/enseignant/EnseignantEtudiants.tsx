import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, Mail, Phone, GraduationCap } from 'lucide-react';

// Données simulées
const mockSalles = [
  { id: '1', nom: 'Salle A1', college: 'Collège Central' },
  { id: '2', nom: 'Salle B2', college: 'Collège Central' },
];

const mockEtudiants = [
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@email.com',
    telephone: '0612345678',
    salleId: '1',
    salle: { nom: 'Salle A1' },
    moyenne: 15.5,
    anneeScolaire: '2024-2025',
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Jean',
    email: 'jean.martin@email.com',
    telephone: '0623456789',
    salleId: '1',
    salle: { nom: 'Salle A1' },
    moyenne: 12.0,
    anneeScolaire: '2024-2025',
  },
  {
    id: '3',
    nom: 'Bernard',
    prenom: 'Sophie',
    email: 'sophie.bernard@email.com',
    telephone: '0634567890',
    salleId: '2',
    salle: { nom: 'Salle B2' },
    moyenne: 14.2,
    anneeScolaire: '2024-2025',
  },
  {
    id: '4',
    nom: 'Petit',
    prenom: 'Lucas',
    email: 'lucas.petit@email.com',
    telephone: '0645678901',
    salleId: '1',
    salle: { nom: 'Salle A1' },
    moyenne: 18.0,
    anneeScolaire: '2024-2025',
  },
  {
    id: '5',
    nom: 'Robert',
    prenom: 'Emma',
    email: 'emma.robert@email.com',
    telephone: '0656789012',
    salleId: '2',
    salle: { nom: 'Salle B2' },
    moyenne: 9.5,
    anneeScolaire: '2024-2025',
  },
];

export default function EnseignantEtudiants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSalle, setFilterSalle] = useState('all');

  const filteredEtudiants = mockEtudiants.filter(etudiant => {
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSalle = filterSalle === 'all' || etudiant.salleId === filterSalle;
    return matchesSearch && matchesSalle;
  });

  const getMoyenneColor = (moyenne: number) => {
    if (moyenne >= 16) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (moyenne >= 12) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (moyenne >= 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom[0]}${nom[0]}`.toUpperCase();
  };

  // Stats par salle
  const statsBySalle = mockSalles.map(salle => {
    const etudiantsSalle = mockEtudiants.filter(e => e.salleId === salle.id);
    const moyenneSalle = etudiantsSalle.length > 0 
      ? etudiantsSalle.reduce((acc, e) => acc + e.moyenne, 0) / etudiantsSalle.length
      : 0;
    return {
      ...salle,
      nbEtudiants: etudiantsSalle.length,
      moyenne: moyenneSalle.toFixed(1),
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes étudiants</h1>
          <p className="text-muted-foreground">
            Consultez la liste des étudiants dans vos classes
          </p>
        </div>

        {/* Stats par salle */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statsBySalle.map((salle) => (
            <Card key={salle.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{salle.nom}</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salle.nbEtudiants}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {salle.moyenne}/20
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

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
              {mockSalles.map(salle => (
                <SelectItem key={salle.id} value={salle.id}>{salle.nom}</SelectItem>
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
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Salle</TableHead>
                    <TableHead className="text-center">Moyenne</TableHead>
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
                            <p className="text-xs text-muted-foreground">
                              {etudiant.anneeScolaire}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{etudiant.email}</span>
                          </div>
                          {etudiant.telephone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{etudiant.telephone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{etudiant.salle.nom}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getMoyenneColor(etudiant.moyenne)}>
                          {etudiant.moyenne.toFixed(1)}/20
                        </Badge>
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
