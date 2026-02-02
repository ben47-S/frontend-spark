import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, FileText, Calendar } from 'lucide-react';

const stats = [
  { label: 'Mes cours', value: '4', icon: BookOpen },
  { label: 'Mes étudiants', value: '86', icon: Users },
  { label: 'Notes saisies', value: '324', icon: FileText },
];

const courses = [
  { name: 'Algèbre', department: 'Mathématiques', students: 28 },
  { name: 'Géométrie', department: 'Mathématiques', students: 25 },
  { name: 'Analyse', department: 'Mathématiques', students: 22 },
  { name: 'Probabilités', department: 'Mathématiques', students: 11 },
];

export default function EnseignantDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, Professeur</h1>
          <p className="text-muted-foreground">
            Année scolaire 2024-2025
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* My Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Mes cours</CardTitle>
            <CardDescription>
              Liste des matières que vous enseignez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{course.students} étudiants</p>
                    <button className="text-sm text-primary hover:underline">
                      Saisir les notes →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rappels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <p className="text-sm">Notes d'Algèbre à saisir avant le 15/02</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <p className="text-sm">Réunion département demain à 14h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
