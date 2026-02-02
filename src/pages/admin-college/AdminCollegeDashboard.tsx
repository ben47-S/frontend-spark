import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BookOpen, ClipboardList, Home, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Départements', value: '6', icon: BookOpen, trend: '+1 ce mois' },
  { label: 'Enseignants', value: '18', icon: Users, trend: '+2 ce mois' },
  { label: 'Étudiants', value: '342', icon: Users, trend: '+28 ce mois' },
  { label: 'Inscriptions en attente', value: '8', icon: ClipboardList, trend: 'À traiter' },
  { label: 'Salles', value: '12', icon: Home, trend: 'Capacité totale: 360' },
];

export default function AdminCollegeDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administration</h1>
          <p className="text-muted-foreground">
            Gestion de votre collège
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pending Inscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes d'inscription en attente</CardTitle>
            <CardDescription>
              Étudiants en attente de validation pour l'année 2024-2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Étudiant Demo {i}</p>
                    <p className="text-sm text-muted-foreground">etudiant{i}@student.com • Soumis il y a {i} jour(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200">
                      Accepter
                    </button>
                    <button className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200">
                      Refuser
                    </button>
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
