import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth, getDefaultRoute } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si déjà connecté
  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">UICI Academy</CardTitle>
          <CardDescription>
            Système de Gestion Académique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Lien d'inscription */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Pas encore de compte ?
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild className="w-full">
                <Link to="/register">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Étudiant
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/register/enseignant">
                  Enseignant
                </Link>
              </Button>
            </div>
          </div>

          {/* Comptes de test - à retirer en production */}
          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Comptes de test :</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin@academy.com</p>
              <p><strong>Enseignant:</strong> prof.martin@academy.com</p>
              <p><strong>Étudiant:</strong> fatou.diallo@student.com</p>
              <p><strong>Mot de passe:</strong> password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
