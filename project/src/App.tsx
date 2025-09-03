import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PlanosPage from './pages/PlanosPage';
import ComandosPage from './pages/ComandosPage';
import ServidorSuportePage from './pages/ServidorSuportePage';
import DashboardPage from './pages/DashboardPage';
import ServidoresPage from './pages/ServidoresPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/planos" element={<PlanosPage />} />
            <Route path="/comandos" element={<ComandosPage />} />
            <Route path="/servidor-de-suporte" element={<ServidorSuportePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard/*" element={<DashboardPage />} />
            <Route path="/servidores" element={<ServidoresPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;