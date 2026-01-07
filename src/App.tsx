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
import RegistrationCodes from "./pages/admin/RegistrationCodes";
import AdminSettings from "./pages/admin/AdminSettings";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Patient Pages
import PatientsList from "./pages/patients/PatientsList";
import CreatePatient from "./pages/patients/CreatePatient";
import PatientProfile from "./pages/patients/PatientProfile";
import EditPatient from "./pages/patients/EditPatient";

// Visit Pages
import VisitsList from "./pages/visits/VisitsList";
import CreateVisit from "./pages/visits/CreateVisit";
import VisitDetails from "./pages/visits/VisitDetails";

// Appointment Pages
import AppointmentsList from "./pages/appointments/AppointmentsList";

// Follow-up Pages
import FollowUpsList from "./pages/follow-ups/FollowUpsList";

// Settings & Profile
import SettingsPage from "./pages/settings/SettingsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ReportsPage from "./pages/reports/ReportsPage";

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
                  <DoctorDashboard />
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
              <Route path="/admin/codes" element={
                <ProtectedRoute requiredRole="admin">
                  <RegistrationCodes />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
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
              <Route path="/patients/:id/edit" element={
                <ProtectedRoute>
                  <EditPatient />
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

              {/* Settings & Profile */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportsPage />
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
