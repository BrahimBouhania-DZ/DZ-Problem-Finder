import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/pages/public/LandingPage';
import SectorSelectorPage from '@/pages/public/SectorSelectorPage';
import SurveyPage from '@/pages/public/SurveyPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'select-sector', element: <SectorSelectorPage /> },
      { path: 'survey', element: <SurveyPage /> },
    ],
  },
]);

export default router;
