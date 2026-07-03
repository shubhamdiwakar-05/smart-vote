import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ElectionListPage from '../pages/ElectionListPage';
import VotePage from '../pages/VotePage';
import ResultsPage from '../pages/ResultsPage';
import ProfilePage from '../pages/ProfilePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import OnboardingPage from '../pages/OnboardingPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminElectionsPage from '../pages/admin/AdminElectionsPage';
import AdminCandidatesPage from '../pages/admin/AdminCandidatesPage';
import AdminVotersPage from '../pages/admin/AdminVotersPage';
import AdminResultsPage from '../pages/admin/AdminResultsPage';
import AdminSupportPage from '../pages/admin/AdminSupportPage';

import AdminRoute from './AdminRoute';
import { useUser } from '@clerk/react';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded, user } = useUser();
  
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if onboarding is complete
  const isOnboardingComplete = user?.unsafeMetadata?.onboardingComplete;
  if (!isOnboardingComplete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (isOnboardingComplete && window.location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Voter Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/elections" element={<ProtectedRoute><ElectionListPage /></ProtectedRoute>} />
      <Route path="/vote" element={<ProtectedRoute><VotePage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      {/* Admin Routes — protected by AdminRoute guard */}
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/elections" element={<AdminRoute><AdminElectionsPage /></AdminRoute>} />
      <Route path="/admin/candidates" element={<AdminRoute><AdminCandidatesPage /></AdminRoute>} />
      <Route path="/admin/voters" element={<AdminRoute><AdminVotersPage /></AdminRoute>} />
      <Route path="/admin/results" element={<AdminRoute><AdminResultsPage /></AdminRoute>} />
      <Route path="/admin/support" element={<AdminRoute><AdminSupportPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
