import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, getDefaultRoute } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, GraduationCap, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import type { College, Departement } from '@/types/api';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  telephone: string;
  collegeId: string;
  departementId: string;
  datePriseFonction: string;
}

export default function RegisterEnseignant() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    telephone: '',
    collegeId: '',
    departementId: '',
    datePriseFonction: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await apiGet<College[]>('/colleges', { requiresAuth: false });
        if (response.success && response.data) {
          setColleges(response.data);
        }
      } catch (err) {
        console.error('Erreur chargement collèges:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchColleges();
  }, []);

  // Charger les départements quand un collège est sélectionné
  useEffect(() => {
    if (formData.collegeId) {
      const fetchDepartements = async () => {
        try {
          const response = await apiGet<Departement[]>(`/colleges/${formData.collegeId}/departements`, { requiresAuth: false });
          if (response.success && response.data) {
            setDepartements(response.data);
          }
        } catch (err) {
          console.error('Erreur chargement départements:', err);
        }
      };
      fetchDepartements();
    } else {
      setDepartements([]);
    }
  }, [formData.collegeId]);

  // Rediriger si déjà connecté
  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (!formData.collegeId) {
      setError('Veuillez sélectionner un collège');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiPost('/auth/register/enseignant', {
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone || undefined,
        collegeId: formData.collegeId,
        departementId: formData.departementId || undefined,
        datePriseFonction: new Date(formData.datePriseFonction).toISOString(),
      }, { requiresAuth: false });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error?.message || 'Erreur lors de l\'inscription');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Inscription réussie !</CardTitle>
            <CardDescription>
              Votre compte enseignant a été créé. Vous pouvez maintenant vous connecter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Inscription Enseignant</CardTitle>
          <CardDescription>
            Créez votre compte enseignant pour rejoindre un établissement
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  placeholder="Jean"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  placeholder="Martin"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone (optionnel)</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+221 77 123 45 67"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">Collège</Label>
              <Select
                value={formData.collegeId}
                onValueChange={(value) => handleChange('collegeId', value)}
                disabled={isLoading || loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un collège" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {departements.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="departement">Département (optionnel)</Label>
                <Select
                  value={formData.departementId}
                  onValueChange={(value) => handleChange('departementId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departements.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>
                        {dep.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="datePriseFonction">Date de prise de fonction</Label>
              <Input
                id="datePriseFonction"
                type="date"
                value={formData.datePriseFonction}
                onChange={(e) => handleChange('datePriseFonction', e.target.value)}
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
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || loadingData}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
