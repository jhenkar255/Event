import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AIEventWizardModal } from './components/ai/AIEventWizardModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ProfilePage } from './pages/auth/ProfilePage';

// Admin Auth & Portal Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/admin/AdminResetPasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Organizer Dashboard & Studio Pages
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { MandapStudioPage } from './pages/organizer/MandapStudioPage';
import { SeatingPlannerPage } from './pages/organizer/SeatingPlannerPage';
import { QRScannerPage } from './pages/organizer/QRScannerPage';

// Main Application Pages
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventWizardPage } from './pages/EventWizardPage';
import { EventCommandCenterPage } from './pages/EventCommandCenterPage';
import { VenuesPage } from './pages/venues/VenuesPage';
import { VenueDetailPage } from './pages/venues/VenueDetailPage';
import { DecorationsPage } from './pages/marketplace/DecorationsPage';
import { CateringPage } from './pages/marketplace/CateringPage';
import { EntertainmentPage } from './pages/marketplace/EntertainmentPage';
import { PublicInvitationPage } from './pages/PublicInvitationPage';
import { AIPlannerPage } from './pages/AIPlannerPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UserQRTicketPage } from './pages/events/UserQRTicketPage';
import { OrganizerGateScannerPage } from './pages/organizer/OrganizerGateScannerPage';
import { AdminEventAttendancePage } from './pages/admin/AdminEventAttendancePage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);

  // Hide Navbar and Footer on standalone public invitation e-card or specialized auth screens if needed
  const isPublicInvite = location.pathname.startsWith('/invite/');

  return (
    <div className="min-h-screen flex flex-col bg-utsav-ivory text-utsav-brown dark:bg-utsav-maroon-950 dark:text-utsav-ivory transition-colors duration-200">
      <AIEventWizardModal isOpen={isAiWizardOpen} onClose={() => setIsAiWizardOpen(false)} />

      {!isPublicInvite && <Navbar onOpenAiWizard={() => setIsAiWizardOpen(true)} />}

      <main className="flex-1">
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Dedicated Admin Authentication & Control Center */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:eventId/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
                <AdminEventAttendancePage />
              </ProtectedRoute>
            }
          />

          {/* Dedicated Organizer Dashboard & Studio Tools */}
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <OrganizerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:eventId/scanner"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <OrganizerGateScannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mandap-builder"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN', 'USER']}>
                <MandapStudioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seating"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN', 'USER']}>
                <SeatingPlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <QRScannerPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Client / Host Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/qr"
            element={
              <ProtectedRoute>
                <UserQRTicketPage />
              </ProtectedRoute>
            }
          />

          {/* Events, Marketplace, & Planning Features */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<EventWizardPage />} />
          <Route path="/events/:id" element={<EventCommandCenterPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venues/:id" element={<VenueDetailPage />} />
          <Route path="/decorations" element={<DecorationsPage />} />
          <Route path="/catering" element={<CateringPage />} />
          <Route path="/entertainment" element={<EntertainmentPage />} />
          <Route path="/invite/:token" element={<PublicInvitationPage />} />
          <Route path="/ai-planner" element={<AIPlannerPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </main>

      {!isPublicInvite && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppLayout />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
