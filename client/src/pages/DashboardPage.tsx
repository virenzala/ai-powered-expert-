import React, { useState, useEffect } from 'react';
import { StatsCard } from '../components/common/StatsCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DashboardData } from '../types';
import { Users, CheckCircle2, XCircle, Sparkles, Send, MessageSquare, CalendarCheck, Flag, Play, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Loading ExportFlow Dashboard...</div>;
  }

  const { kpis, funnel, campaignSummaries, followUpsDueToday, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Export Outreach Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics for international buyer lead acquisition, email validation, AI scoring, and Gmail campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/import')}>
            Import CSV Buyers
          </Button>
          <Button onClick={() => navigate('/campaigns')}>
            Launch Campaign
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={kpis.totalLeads}
          change="+12% this wk"
          icon={<Users className="w-5 h-5" />}
        />
        <StatsCard
          title="Valid Contacts"
          value={kpis.validContacts}
          change={`${Math.round((kpis.validContacts / (kpis.totalLeads || 1)) * 100)}% Deliverable`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatsCard
          title="Qualified Buyers"
          value={kpis.qualifiedBuyers}
          change="AI Score ≥70"
          icon={<Sparkles className="w-5 h-5 text-blue-500" />}
        />
        <StatsCard
          title="Emails Sent"
          value={kpis.emailsSent}
          change={`${kpis.responses} Responses`}
          icon={<Send className="w-5 h-5 text-indigo-500" />}
        />
      </div>

      {/* Main Grid: Funnel & Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Funnel Card */}
        <Card title="Lead Acquisition Funnel" className="lg:col-span-1">
          <div className="space-y-3 mt-2">
            {funnel.map((item, index) => {
              const maxCount = funnel[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.stage}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Active Campaigns Card */}
        <Card
          title="Active Outreach Campaigns"
          action={
            <Button size="sm" variant="ghost" onClick={() => navigate('/campaigns')}>
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {campaignSummaries.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active campaigns currently running.</p>
            ) : (
              campaignSummaries.map((c) => (
                <div
                  key={c._id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{c.name}</h4>
                    <p className="text-slate-500 mt-0.5">
                      Product: <strong>{c.product}</strong> • Limit: {c.dailySendingLimit}/day
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.stats?.sentCount || 0} / {c.stats?.validRecipients || 0}
                      </span>
                      <p className="text-[10px] text-slate-400">Emails Sent</p>
                    </div>
                    <Badge variant={c.status === 'Running' ? 'valid' : 'neutral'}>{c.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Follow-ups Due Today & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-ups Due Today */}
        <Card
          title="Follow-up Tasks Due Today"
          action={
            <Button size="sm" variant="ghost" onClick={() => navigate('/followups')}>
              Tasks Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {followUpsDueToday.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No pending follow-ups due today.</p>
            ) : (
              followUpsDueToday.map((f: any) => (
                <div key={f._id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">{f.title}</span>
                    <p className="text-slate-500">
                      Lead: <strong>{f.leadId?.contactName}</strong> ({f.leadId?.companyName})
                    </p>
                  </div>
                  <Badge variant="risky">{f.priority} Priority</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Audit Log Activity Stream */}
        <Card title="System Activity Audit Log">
          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {recentActivity.map((act) => (
              <div key={act._id} className="flex gap-3 text-xs items-start border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{act.action}</p>
                  <p className="text-slate-500 leading-normal">{act.details}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
