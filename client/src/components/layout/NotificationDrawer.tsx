import React from 'react';
import { Drawer } from '../common/Drawer';
import { Notification } from '../../types';
import { CheckCircle2, Info, AlertTriangle, XCircle, Check } from 'lucide-react';
import api from '../../services/api';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRefresh: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
}) => {
  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const icons = {
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Activity Notifications" subtitle="Real-time system events & campaign updates">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {notifications.length} Messages
        </span>
        <button
          onClick={markAllRead}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          <Check className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 rounded-xl border transition-all ${
                n.read
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-70'
                  : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {icons[n.type]}
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                  <span className="mt-1.5 inline-block text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};
