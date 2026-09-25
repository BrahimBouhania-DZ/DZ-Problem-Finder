import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import LandingPage from '@/pages/public/LandingPage';
import SectorSelectorPage from '@/pages/public/SectorSelectorPage';
import SurveyPage from '@/pages/public/SurveyPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProblemsPage from '@/pages/admin/ProblemsPage';

const router = createBrowserRouter([
  // ========= Public =========
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,          element: <LandingPage /> },
      { path: 'select-sector', element: <SectorSelectorPage /> },
      { path: 'survey',        element: <SurveyPage /> },
    ],
  },
  // ========= Admin =========
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,           element: <AdminDashboard /> },
      { path: 'problems',      element: <ProblemsPage /> },
    ],
  },
]);

export default router;
