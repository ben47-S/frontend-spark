import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages publiques
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterEnseignant from "./pages/RegisterEnseignant";
import NotFound from "./pages/NotFound";

// Dashboards par rôle
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnneesScolaires from "./pages/admin/AdminAnneesScolaires";
import AdminColleges from "./pages/admin/AdminColleges";
import AdminCollegeDashboard from "./pages/admin-college/AdminCollegeDashboard";
import AdminCollegeSalles from "./pages/admin-college/AdminCollegeSalles";
import AdminCollegeDepartements from "./pages/admin-college/AdminCollegeDepartements";
import AdminCollegeMatieres from "./pages/admin-college/AdminCollegeMatieres";
import AdminCollegeEnseignants from "./pages/admin-college/AdminCollegeEnseignants";
import EnseignantDashboard from "./pages/enseignant/EnseignantDashboard";
import EnseignantDemandes from "./pages/enseignant/EnseignantDemandes";
import EnseignantCours from "./pages/enseignant/EnseignantCours";
import EnseignantNotes from "./pages/enseignant/EnseignantNotes";
import EnseignantEtudiants from "./pages/enseignant/EnseignantEtudiants";
import EtudiantDashboard from "./pages/etudiant/EtudiantDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";

// Inscriptions
import EtudiantInscription from "./pages/etudiant/EtudiantInscription";
import AdminInscriptions from "./pages/admin/AdminInscriptions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/enseignant" element={<RegisterEnseignant />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Global routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_GLOBAL']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/annees-scolaires"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_GLOBAL']}>
                  <AdminAnneesScolaires />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/colleges"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_GLOBAL']}>
                  <AdminColleges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inscriptions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_GLOBAL']}>
                  <AdminInscriptions />
                </ProtectedRoute>
              }
            />

            {/* Admin College routes */}
            <Route
              path="/admin-college"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_COLLEGE']}>
                  <AdminCollegeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-college/salles"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_COLLEGE']}>
                  <AdminCollegeSalles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-college/departements"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_COLLEGE']}>
                  <AdminCollegeDepartements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-college/matieres"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_COLLEGE']}>
                  <AdminCollegeMatieres />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-college/enseignants"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_COLLEGE']}>
                  <AdminCollegeEnseignants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-college/inscriptions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_COLLEGE']}>
                  <AdminInscriptions />
                </ProtectedRoute>
              }
            />

            {/* Enseignant routes */}
            <Route
              path="/enseignant"
              element={
                <ProtectedRoute allowedRoles={['ENSEIGNANT']}>
                  <EnseignantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enseignant/demandes"
              element={
                <ProtectedRoute allowedRoles={['ENSEIGNANT']}>
                  <EnseignantDemandes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enseignant/cours"
              element={
                <ProtectedRoute allowedRoles={['ENSEIGNANT']}>
                  <EnseignantCours />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enseignant/notes"
              element={
                <ProtectedRoute allowedRoles={['ENSEIGNANT']}>
                  <EnseignantNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enseignant/etudiants"
              element={
                <ProtectedRoute allowedRoles={['ENSEIGNANT']}>
                  <EnseignantEtudiants />
                </ProtectedRoute>
              }
            />

            {/* Etudiant routes */}
            <Route
              path="/etudiant"
              element={
                <ProtectedRoute allowedRoles={['ETUDIANT']}>
                  <EtudiantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etudiant/inscription"
              element={
                <ProtectedRoute allowedRoles={['ETUDIANT']}>
                  <EtudiantInscription />
                </ProtectedRoute>
              }
            />

            {/* Parent routes */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
