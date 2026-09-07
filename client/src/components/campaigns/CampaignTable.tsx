import React from 'react';
import { Campaign } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Play, Pause, CheckCircle2, Sparkles, Send, Eye } from 'lucide-react';

export interface CampaignTableProps {
  campaigns: Campaign[];
  onView: (c: Campaign) => void;
  onGenerateDrafts: (id: string) => void;
  onApprove: (c: Campaign) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  userRole?: string;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onView,
  onGenerateDrafts,
  onApprove,
  onStart,
  onPause,
  userRole,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Running': return 'valid';
      case 'Approved': return 'high';
      case 'Pending Approval': return 'risky';
      case 'Completed': return 'purple';
      case 'Paused': return 'disposable';
      default: return 'neutral';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/60 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4">Campaign Name</th>
              <th className="py-3.5 px-4">Product & Segment</th>
              <th className="py-3.5 px-4">Recipients</th>
              <th className="py-3.5 px-4">Daily Limit</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No outreach campaigns found. Create your first campaign wizard.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <span
                        onClick={() => onView(c)}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer block text-sm"
                      >
                        {c.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">Created by {c.createdBy?.name || 'Manager'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{c.product}</div>
                    <div className="text-slate-500 text-[11px]">
                      {c.targetCountries?.join(', ') || 'All Markets'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {c.stats?.sentCount || 0} / {c.stats?.validRecipients || 0} Sent
                    </div>
                    <div className="text-slate-400 text-[11px]">{c.stats?.totalRecipients || 0} Total Leads</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">{c.dailySendingLimit} / day</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Campaign Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {c.status === 'Draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Sparkles className="w-3.5 h-3.5" />}
                          onClick={() => onGenerateDrafts(c._id)}
                        >
                          Generate AI Drafts
                        </Button>
                      )}

                      {c.status === 'Pending Approval' && (userRole === 'Admin' || userRole === 'Manager') && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => onApprove(c)}
                        >
                          Manager Approve
                        </Button>
                      )}

                      {c.status === 'Approved' && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={<Play className="w-3.5 h-3.5" />}
                          onClick={() => onStart(c._id)}
                        >
                          Start Sending
                        </Button>
                      )}

                      {c.status === 'Running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Pause className="w-3.5 h-3.5" />}
                          onClick={() => onPause(c._id)}
                        >
                          Pause
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
