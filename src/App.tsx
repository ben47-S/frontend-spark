import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Dashboards par rôle
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCollegeDashboard from "./pages/admin-college/AdminCollegeDashboard";
import EnseignantDashboard from "./pages/enseignant/EnseignantDashboard";
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
