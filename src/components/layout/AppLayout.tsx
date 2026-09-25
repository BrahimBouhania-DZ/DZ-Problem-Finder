import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar/Navbar';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
