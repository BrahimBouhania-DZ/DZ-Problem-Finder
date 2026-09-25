import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
