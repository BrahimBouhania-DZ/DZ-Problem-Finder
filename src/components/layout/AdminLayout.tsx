import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Navbar isAdmin />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
