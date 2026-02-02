import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Building2, Users, BookOpen, ClipboardList, FileText, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Collèges', value: '5', icon: Building2, trend: '+1 ce mois' },
  { label: 'Départements', value: '24', icon: BookOpen, trend: '+3 ce mois' },
  { label: 'Enseignants', value: '89', icon: Users, trend: '+5 ce mois' },
  { label: 'Étudiants', value: '1,245', icon: Users, trend: '+120 ce mois' },
  { label: 'Inscriptions en attente', value: '23', icon: ClipboardList, trend: 'À traiter' },
  { label: 'Années scolaires', value: '3', icon: FileText, trend: '1 active' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin Global</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble du système académique UICI
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

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inscriptions récentes</CardTitle>
              <CardDescription>
                Les 5 dernières demandes d'inscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">Étudiant {i}</p>
                      <p className="text-xs text-muted-foreground">Collège Einstein</p>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      En attente
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Les dernières actions du système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm">Nouveau collège créé</p>
                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm">3 inscriptions acceptées</p>
                    <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <div>
                    <p className="text-sm">Année 2024-2025 activée</p>
                    <p className="text-xs text-muted-foreground">Hier</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
