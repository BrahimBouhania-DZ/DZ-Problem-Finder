import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Users, ClipboardList, CheckSquare, Settings } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/admin',           icon: LayoutDashboard, label: 'الرئيسية',    end: true },
  { to: '/admin/problems',  icon: AlertCircle,     label: 'المشاكل'             },
  { to: '/admin/responses', icon: Users,           label: 'المشاركون'           },
  { to: '/admin/surveys',   icon: ClipboardList,   label: 'الاستبيانات'         },
  { to: '/admin/validation',icon: CheckSquare,     label: 'التحقق'              },
  { to: '/admin/settings',  icon: Settings,        label: 'الإعدادات'           },
];

export const Sidebar = () => (
  <aside className="sidebar">
    <nav className="sidebar__nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
          }
        >
          <Icon size={20} className="sidebar__icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);
