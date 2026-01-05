import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ClinicProvider } from "@/hooks/useClinic";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClinicsManagement from "./pages/admin/ClinicsManagement";
import CreateClinic from "./pages/admin/CreateClinic";
import UsersManagement from "./pages/admin/UsersManagement";
import AuditLogs from "./pages/admin/AuditLogs";

// Patient Pages
import PatientsList from "./pages/patients/PatientsList";
import CreatePatient from "./pages/patients/CreatePatient";
import PatientProfile from "./pages/patients/PatientProfile";

// Visit Pages
import VisitsList from "./pages/visits/VisitsList";
import CreateVisit from "./pages/visits/CreateVisit";
import VisitDetails from "./pages/visits/VisitDetails";

// Appointment Pages
import AppointmentsList from "./pages/appointments/AppointmentsList";

// Follow-up Pages
import FollowUpsList from "./pages/follow-ups/FollowUpsList";

// Admin - Registration Codes
import RegistrationCodes from "./pages/admin/RegistrationCodes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ClinicProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Doctor Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/clinics" element={
                <ProtectedRoute requiredRole="admin">
                  <ClinicsManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/clinics/new" element={
                <ProtectedRoute requiredRole="admin">
                  <CreateClinic />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <UsersManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit" element={
                <ProtectedRoute requiredRole="admin">
                  <AuditLogs />
                </ProtectedRoute>
              } />

              {/* Patient Routes */}
              <Route path="/patients" element={
                <ProtectedRoute>
                  <PatientsList />
                </ProtectedRoute>
              } />
              <Route path="/patients/new" element={
                <ProtectedRoute>
                  <CreatePatient />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id" element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              } />

              {/* Visit Routes */}
              <Route path="/visits" element={
                <ProtectedRoute>
                  <VisitsList />
                </ProtectedRoute>
              } />
              <Route path="/visits/new" element={
                <ProtectedRoute>
                  <CreateVisit />
                </ProtectedRoute>
              } />
              <Route path="/visits/:id" element={
                <ProtectedRoute>
                  <VisitDetails />
                </ProtectedRoute>
              } />

              {/* Appointment Routes */}
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <AppointmentsList />
                </ProtectedRoute>
              } />

              {/* Follow-up Routes */}
              <Route path="/follow-ups" element={
                <ProtectedRoute>
                  <FollowUpsList />
                </ProtectedRoute>
              } />

              {/* Admin - Registration Codes */}
              <Route path="/admin/codes" element={
                <ProtectedRoute requiredRole="admin">
                  <RegistrationCodes />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ClinicProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
