import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, FileText, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const enfants = [
  { 
    id: '1',
    nom: 'Diallo', 
    prenom: 'Fatou', 
    moyenne: 15.46, 
    college: 'Collège Einstein',
    salle: 'Salle A1'
  },
  { 
    id: '2',
    nom: 'Diallo', 
    prenom: 'Mamadou', 
    moyenne: 13.2, 
    college: 'Collège Einstein',
    salle: 'Salle B2'
  },
];

export default function ParentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Espace Parent</h1>
          <p className="text-muted-foreground">
            Suivez les résultats scolaires de vos enfants
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enfants inscrits</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enfants.length}</div>
              <p className="text-xs text-muted-foreground">
                Année scolaire 2024-2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne globale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14.33/20</div>
              <p className="text-xs text-muted-foreground">
                Tous les enfants combinés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des enfants */}
        <Card>
          <CardHeader>
            <CardTitle>Mes enfants</CardTitle>
            <CardDescription>
              Cliquez sur un enfant pour voir ses résultats détaillés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enfants.map((enfant) => (
                <div key={enfant.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                      {enfant.prenom[0]}{enfant.nom[0]}
                    </div>
                    <div>
                      <p className="font-medium">{enfant.prenom} {enfant.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {enfant.college} • {enfant.salle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${enfant.moyenne >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {enfant.moyenne}/20
                      </p>
                      <p className="text-xs text-muted-foreground">Moyenne</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/parent/enfants/${enfant.id}/notes`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Voir notes
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
