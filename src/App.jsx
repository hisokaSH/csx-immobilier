import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import PublicListing from './pages/PublicListing';

// Protected pages
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import Leads from './pages/Leads';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import AITools from './pages/AITools';

// Tools
import ToolsHub from './pages/tools/ToolsHub';
import PropertyValuation from './pages/tools/PropertyValuation';
import LeadScoring from './pages/tools/LeadScoring';
import PhotoEnhancement from './pages/tools/PhotoEnhancement';
import MultiLanguageTranslation from './pages/tools/MultiLanguageTranslation';
import LeadFollowup from './pages/tools/LeadFollowup';
import SmartCalendar from './pages/tools/SmartCalendar';
import ClientPortal from './pages/tools/ClientPortal';
import ReviewCollection from './pages/tools/ReviewCollection';
import MarketInsights from './pages/tools/MarketInsights';
import PerformanceReports from './pages/tools/PerformanceReports';
import MortgageCalculator from './pages/tools/MortgageCalculator';
import DocumentGenerator from './pages/tools/DocumentGenerator';
import QRCodeFlyer from './pages/tools/QRCodeFlyer';
import VirtualTour from './pages/tools/VirtualTour';
import VoiceNotes from './pages/tools/VoiceNotes';
import WhatsAppIntegration from './pages/tools/WhatsAppIntegration';
import NeighborhoodInfo from './pages/tools/NeighborhoodInfo';

// Layout wrapper for dashboard pages
function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px',
        padding: '32px',
        background: 'var(--bg-primary)',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}

// Redirect logged in users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />

      {/* Public listing view */}
      <Route path="/p/:id" element={<PublicListing />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/listings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Listings />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/listings/new" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CreateListing />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/listings/:id/edit" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CreateListing />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/leads" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Leads />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/accounts" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Accounts />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-tools" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AITools />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Tools Routes */}
      <Route path="/tools" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ToolsHub />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/valuation" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PropertyValuation />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/lead-scoring" element={
        <ProtectedRoute>
          <DashboardLayout>
            <LeadScoring />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/photo-enhancement" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PhotoEnhancement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/translation" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MultiLanguageTranslation />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/followup" element={
        <ProtectedRoute>
          <DashboardLayout>
            <LeadFollowup />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/calendar" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SmartCalendar />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/client-portal" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ClientPortal />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/reviews" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ReviewCollection />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/market-insights" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MarketInsights />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/performance" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PerformanceReports />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/mortgage" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MortgageCalculator />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/documents" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DocumentGenerator />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/qr-flyer" element={
        <ProtectedRoute>
          <DashboardLayout>
            <QRCodeFlyer />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/virtual-tour" element={
        <ProtectedRoute>
          <DashboardLayout>
            <VirtualTour />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/voice-notes" element={
        <ProtectedRoute>
          <DashboardLayout>
            <VoiceNotes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/whatsapp" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WhatsAppIntegration />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tools/neighborhood" element={
        <ProtectedRoute>
          <DashboardLayout>
            <NeighborhoodInfo />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
