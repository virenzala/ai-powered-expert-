import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, MailCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export interface HeaderProps {
  onToggleNotifications: () => void;
  unreadNotificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onToggleNotifications, unreadNotificationCount }) => {
  const { user, logout } = useAuth();
  const [gmailConnected, setGmailConnected] = useState<boolean>(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkGmail = async () => {
      try {
        const res = await api.get('/gmail/status');
        setGmailConnected(res.data.data.connected);
      } catch (err) {
        setGmailConnected(false);
      }
    };
    checkGmail();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, companies, products..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none text-xs rounded-xl pl-9 pr-4 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-4">
        {/* Gmail Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${
            gmailConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}
          title={gmailConnected ? 'Gmail Integration Active' : 'Gmail Not Connected'}
        >
          <MailCheck className="w-3.5 h-3.5" />
          <span>{gmailConnected ? 'Gmail Connected' : 'Gmail Adapter Mock'}</span>
        </div>

        {/* AI Safeguard Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Outreach Approval Active</span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-sm border border-blue-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
            )}
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <a
                href="/profile"
                onClick={(e) => {
                  e.preventDefault();
                  setUserDropdownOpen(false);
                  window.location.href = '/profile';
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-medium transition-colors border-b border-slate-100 dark:border-slate-700/60"
              >
                <span>My Profile & Avatar</span>
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
