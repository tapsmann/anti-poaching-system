import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Species from './pages/Species';
import Rangers from './pages/Rangers';
import Patrols from './pages/Patrols';
import Analytics from './pages/Analytics';
import ProtectedAreas from './pages/ProtectedAreas';
import Reports from './pages/Reports';
import Equipment from './pages/Equipment';
import Observations from './pages/Observations';
import Poachers from './pages/Poachers';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="species" element={<Species />} />
              <Route path="rangers" element={<Rangers />} />
              <Route path="patrols" element={<Patrols />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="protected-areas" element={<ProtectedAreas />} />
              <Route path="reports" element={<Reports />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="observations" element={<Observations />} />
              <Route path="poachers" element={<Poachers />} />
              <Route path="alerts" element={<Alerts />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
