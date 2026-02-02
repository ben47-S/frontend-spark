import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api';
import {
  GraduationCap,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Settings,
  Home,
  BookMarked,
  Calendar,
  School,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types/api';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItemsByRole: Record<Role, NavItem[]> = {
  ADMIN_GLOBAL: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Collèges', href: '/admin/colleges', icon: Building2 },
    { label: 'Années scolaires', href: '/admin/annees-scolaires', icon: Calendar },
    { label: 'Inscriptions', href: '/admin/inscriptions', icon: ClipboardList },
  ],
  ADMIN_COLLEGE: [
    { label: 'Dashboard', href: '/admin-college', icon: LayoutDashboard },
    { label: 'Départements', href: '/admin-college/departements', icon: BookOpen },
    { label: 'Matières', href: '/admin-college/matieres', icon: BookMarked },
    { label: 'Enseignants', href: '/admin-college/enseignants', icon: Users },
    { label: 'Inscriptions', href: '/admin-college/inscriptions', icon: ClipboardList },
    { label: 'Salles', href: '/admin-college/salles', icon: Home },
  ],
  ENSEIGNANT: [
    { label: 'Dashboard', href: '/enseignant', icon: LayoutDashboard },
    { label: 'Mes cours', href: '/enseignant/cours', icon: BookOpen },
    { label: 'Notes', href: '/enseignant/notes', icon: FileText },
    { label: 'Étudiants', href: '/enseignant/etudiants', icon: Users },
  ],
  ETUDIANT: [
    { label: 'Dashboard', href: '/etudiant', icon: LayoutDashboard },
    { label: 'Inscription', href: '/etudiant/inscription', icon: ClipboardList },
  ],
  PARENT: [
    { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { label: 'Mes enfants', href: '/parent/enfants', icon: Users },
    { label: 'Notes', href: '/parent/notes', icon: FileText },
  ],
};

// Onglets supplémentaires pour étudiant inscrit (ACCEPTE)
const etudiantAcceptedItems: NavItem[] = [
  { label: 'Mon école', href: '/etudiant/ecole', icon: School },
  { label: 'Mes matières', href: '/etudiant/matieres', icon: BookMarked },
  { label: 'Mes cours', href: '/etudiant/cours', icon: BookOpen },
  { label: 'Ma classe', href: '/etudiant/classe', icon: Users },
  { label: 'Mes notes', href: '/etudiant/notes', icon: FileText },
];

const roleLabels: Record<Role, string> = {
  ADMIN_GLOBAL: 'Administrateur Global',
  ADMIN_COLLEGE: 'Administrateur Collège',
  ENSEIGNANT: 'Enseignant',
  ETUDIANT: 'Étudiant',
  PARENT: 'Parent',
};

interface InscriptionStatus {
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Récupérer le statut d'inscription pour les étudiants
  const { data: inscriptionData } = useQuery({
    queryKey: ['etudiant-inscription-status'],
    queryFn: async () => {
      const response = await apiGet<InscriptionStatus[]>('/inscriptions/me');
      if (response.success && response.data && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    },
    enabled: user?.role === 'ETUDIANT',
    staleTime: 5 * 60 * 1000,
  });

  if (!user) return null;

  // Déterminer les items de navigation
  let navItems = navItemsByRole[user.role] || [];
  
  // Pour les étudiants, ajouter les onglets conditionnellement
  if (user.role === 'ETUDIANT' && inscriptionData?.statut === 'ACCEPTE') {
    navItems = [
      { label: 'Dashboard', href: '/etudiant', icon: LayoutDashboard },
      { label: 'Inscription', href: '/etudiant/inscription', icon: ClipboardList },
      ...etudiantAcceptedItems,
    ];
  }

  const userInitials = user.email.substring(0, 2).toUpperCase();

  const NavLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop - Fixed */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="fixed top-0 left-0 h-screen w-64 flex flex-col border-r bg-card">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold">UICI Academy</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <NavLinks />
          </div>

          {/* Settings & Logout */}
          <div className="border-t p-4 space-y-1">
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-lg font-bold">UICI Academy</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <NavLinks onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
              {/* Mobile Logout */}
              <div className="border-t p-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Role badge - desktop only */}
          <div className="hidden lg:block">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {roleLabels[user.role]}
            </span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoUrl || undefined} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:block">
                  {user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {roleLabels[user.role]}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
