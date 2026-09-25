import { NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  isAdmin?: boolean;
}

export const Navbar = ({ isAdmin }: NavbarProps) => (
  <nav className="navbar">
    <NavLink to="/" className="navbar__logo">
      <div className="navbar__logo-icon">🔎</div>
      <span>كاشف السوق</span>
    </NavLink>

    <div className="navbar__spacer" />

    <div className="navbar__links">
      {isAdmin ? (
        <>
          <NavLink to="/admin" end className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>لوحة التحكم</NavLink>
          <NavLink to="/admin/problems" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>المشاكل</NavLink>
          <NavLink to="/admin/responses" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>المشاركون</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/" end className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>الرئيسية</NavLink>
          <NavLink to="/select-sector" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>ابدأ الاستبيان</NavLink>
        </>
      )}
    </div>
  </nav>
);
