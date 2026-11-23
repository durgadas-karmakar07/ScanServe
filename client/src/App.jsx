import { Navigate, Route, Routes } from 'react-router';
import RequireAuth from './components/RequireAuth.jsx';
import NotFoundPage from './features/common/NotFoundPage.jsx';
import MenuPage from './features/customer/MenuPage.jsx';
import HealthPage from './features/health/HealthPage.jsx';
import LoginPage from './features/owner/LoginPage.jsx';
import MenuEditor from './features/owner/menu/MenuEditor.jsx';
import OwnerLayout from './features/owner/OwnerLayout.jsx';
import QrPoster from './features/owner/QrPoster.jsx';
import RegisterPage from './features/owner/RegisterPage.jsx';
import SettingsPage from './features/owner/SettingsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/owner" replace />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/m/:slug" element={<MenuPage />} />
      <Route path="/owner/login" element={<LoginPage />} />
      <Route path="/owner/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="menu" replace />} />
          <Route path="menu" element={<MenuEditor />} />
          <Route path="qr" element={<QrPoster />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
