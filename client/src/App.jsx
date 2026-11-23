import { Navigate, Route, Routes } from 'react-router';
import RequireAuth from './components/RequireAuth.jsx';
import NotFoundPage from './features/common/NotFoundPage.jsx';
import HealthPage from './features/health/HealthPage.jsx';
import DashboardPage from './features/owner/DashboardPage.jsx';
import LoginPage from './features/owner/LoginPage.jsx';
import RegisterPage from './features/owner/RegisterPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/owner" replace />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/owner/login" element={<LoginPage />} />
      <Route path="/owner/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/owner" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
