import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { supabase } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import VehiclesList from './pages/vehicles/VehiclesList';
import VehicleDetails from './pages/vehicles/VehicleDetails';
import RentalsList from './pages/rentals/RentalsList';
import RentalDetails from './pages/rentals/RentalDetails';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="vehicles">
                <Route index element={<VehiclesList />} />
                <Route path=":id" element={<VehicleDetails />} />
              </Route>
              <Route path="rentals">
                <Route index element={<RentalsList />} />
                <Route path=":id" element={<RentalDetails />} />
              </Route>
              <Route path="maintenance" element={<MaintenanceList />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
