import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, TrendingUp, Award, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

const notes = [
  { matiere: 'Algèbre', note: 15.5, coefficient: 2, date: '15/01/2025' },
  { matiere: 'Géométrie', note: 14.0, coefficient: 1.5, date: '20/01/2025' },
  { matiere: 'Analyse', note: 16.5, coefficient: 2.5, date: '22/01/2025' },
];

export default function EtudiantDashboard() {
  const { user } = useAuth();

  // Calcul de la moyenne pondérée
  const totalPoints = notes.reduce((acc, n) => acc + n.note * n.coefficient, 0);
  const totalCoef = notes.reduce((acc, n) => acc + n.coefficient, 0);
  const moyenne = (totalPoints / totalCoef).toFixed(2);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon espace étudiant</h1>
          <p className="text-muted-foreground">
            Année scolaire 2024-2025 • Salle A1 • Collège Einstein
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moyenne}/20</div>
              <p className="text-xs text-muted-foreground">
                Sur {notes.length} matières
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meilleure note</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16.5/20</div>
              <p className="text-xs text-muted-foreground">Analyse</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut inscription</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">Inscrit</div>
              <p className="text-xs text-muted-foreground">2024-2025</p>
            </CardContent>
          </Card>
        </div>

        {/* Notes récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes notes</CardTitle>
              <CardDescription>
                Notes de l'année scolaire en cours
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/etudiant/notes">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.matiere} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{note.matiere}</p>
                    <p className="text-sm text-muted-foreground">
                      Coefficient {note.coefficient} • {note.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${note.note >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {note.note}/20
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action rapide */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" asChild>
              <Link to="/etudiant/inscription">
                <ClipboardList className="mr-2 h-4 w-4" />
                Demande d'inscription
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/etudiant/notes">
                <FileText className="mr-2 h-4 w-4" />
                Consulter mes notes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
