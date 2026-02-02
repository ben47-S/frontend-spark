import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, MapPin, Users, Search } from 'lucide-react';

// Données simulées - à remplacer par appel API
const mockCours = [
  {
    id: '1',
    matiere: 'Mathématiques',
    salle: { nom: 'Salle A1', capacite: 30 },
    departement: { nom: 'Sciences', college: { nom: 'Collège Central' } },
    anneeScolaire: { libelle: '2024-2025', estActive: true },
    horaire: 'Lundi 08:00 - 10:00',
    nbEtudiants: 25,
  },
  {
    id: '2',
    matiere: 'Physique',
    salle: { nom: 'Salle B2', capacite: 25 },
    departement: { nom: 'Sciences', college: { nom: 'Collège Central' } },
    anneeScolaire: { libelle: '2024-2025', estActive: true },
    horaire: 'Mardi 10:00 - 12:00',
    nbEtudiants: 22,
  },
  {
    id: '3',
    matiere: 'Chimie',
    salle: { nom: 'Labo C1', capacite: 20 },
    departement: { nom: 'Sciences', college: { nom: 'Collège Central' } },
    anneeScolaire: { libelle: '2024-2025', estActive: true },
    horaire: 'Mercredi 14:00 - 16:00',
    nbEtudiants: 18,
  },
];

export default function EnseignantCours() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('all');

  const departements = [...new Set(mockCours.map(c => c.departement.nom))];

  const filteredCours = mockCours.filter(cours => {
    const matchesSearch = cours.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cours.salle.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartement = filterDepartement === 'all' || cours.departement.nom === filterDepartement;
    return matchesSearch && matchesDepartement;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes cours</h1>
          <p className="text-muted-foreground">
            Consultez la liste de vos cours et leurs détails
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterDepartement} onValueChange={setFilterDepartement}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departements.map(dep => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des cours */}
        {filteredCours.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">Aucun cours trouvé</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterDepartement !== 'all' 
                  ? 'Essayez de modifier vos filtres'
                  : 'Vous n\'avez pas encore de cours assignés'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCours.map((cours) => (
              <Card key={cours.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cours.matiere}</CardTitle>
                    {cours.anneeScolaire.estActive && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{cours.departement.nom}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{cours.salle.nom}</span>
                    <span className="text-xs">({cours.salle.capacite} places)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{cours.horaire}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{cours.nbEtudiants} étudiants inscrits</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      {cours.departement.college.nom} • {cours.anneeScolaire.libelle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
