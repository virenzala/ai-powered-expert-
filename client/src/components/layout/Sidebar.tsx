import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  Building2,
  FileSpreadsheet,
  Send,
  FileText,
  CalendarCheck,
  ShieldAlert,
  BarChart3,
  History,
  Settings,
  Globe,
  Sparkles,
  Factory,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Find Buyers (API)', path: '/find-buyers', icon: Search },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Industrial Suite', path: '/industrial', icon: Factory },
    { label: 'Buyer Leads', path: '/leads', icon: Users },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'CSV Import (Optional)', path: '/import', icon: FileSpreadsheet },
    { label: 'Outreach Campaigns', path: '/campaigns', icon: Send },
    { label: 'Email Templates', path: '/templates', icon: FileText },
    { label: 'Follow-up Tasks', path: '/followups', icon: CalendarCheck },
    { label: 'Suppression List', path: '/suppression', icon: ShieldAlert },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <img
          src="/logo.jpg"
          alt="ExportFlow Logo"
          className="w-9 h-9 rounded-xl object-cover border border-blue-500/30 shadow-lg shadow-blue-600/30"
        />
        <div>
          <h1 className="text-base font-bold text-white tracking-wide leading-tight">ExportFlow</h1>
          <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> AI Outreach Engine
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-xl transition-all ${
              isActive ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-slate-800/60'
            }`
          }
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover shadow-md border border-blue-500/30 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Export User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.title || user?.role || 'Sales'}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
