import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { ActivityLog } from '../types';
import { History, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Activity Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">Immutable security log of user authentications, lead modifications, campaign approvals, and outreach executions.</p>
      </div>

      <Card>
        <div className="space-y-4">
          {logs.map((act) => (
            <div key={act._id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-start justify-between gap-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{act.action}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {act.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-normal">{act.details}</p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <User className="w-3 h-3" /> {act.userName} ({act.userRole})
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {new Date(act.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
