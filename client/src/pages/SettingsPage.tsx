import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Tabs } from '../components/common/Tabs';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Settings, Building, Mail, Sparkles, ShieldCheck, Users, Lock } from 'lucide-react';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('org');
  const [org, setOrg] = useState<any>({
    name: 'Apex Industrial Exports',
    exportProducts: 'Industrial Valves, Pumps, CNC Machine Components, Electrical Equipment',
    targetMarkets: 'Germany, USA, UAE, Singapore, Japan, Brazil',
    dailyEmailLimit: 100,
  });
  const [aiSettings, setAiSettings] = useState<any>({
    provider: 'mock',
    apiKey: '',
    model: 'Gemini 1.5 Pro Export Engine',
  });
  const [users, setUsers] = useState<any[]>([]);

  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data.success) {
        if (res.data.data.organization) {
          setOrg({
            ...res.data.data.organization,
            exportProducts: Array.isArray(res.data.data.organization.exportProducts)
              ? res.data.data.organization.exportProducts.join(', ')
              : res.data.data.organization.exportProducts,
            targetMarkets: Array.isArray(res.data.data.organization.targetMarkets)
              ? res.data.data.organization.targetMarkets.join(', ')
              : res.data.data.organization.targetMarkets,
          });
        }
      }
    });

    if (user?.role === 'Admin') {
      api.get('/users').then((res) => {
        if (res.data.success) setUsers(res.data.data);
      });
    }
  }, [user]);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings/organization', {
        ...org,
        exportProducts: org.exportProducts.split(',').map((s: string) => s.trim()),
        targetMarkets: org.targetMarkets.split(',').map((s: string) => s.trim()),
      });
      showToast('Organization settings updated', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  const tabs = [
    { id: 'org', label: 'Organization Info', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'gmail', label: 'Gmail OAuth', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'AI Provider', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'users', label: 'Team Users', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings & Integrations</h1>
        <p className="text-xs text-slate-500 mt-1">Configure company profiles, Gmail OAuth connections, AI model provider keys, and team access.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Organization Settings */}
      {activeTab === 'org' && (
        <Card title="Export Organization Profile">
          <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
            <Input
              label="Company Export Entity Name *"
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              required
            />
            <Input
              label="Export Products (Comma Separated) *"
              value={org.exportProducts}
              onChange={(e) => setOrg({ ...org, exportProducts: e.target.value })}
              required
            />
            <Input
              label="Target Countries / Markets *"
              value={org.targetMarkets}
              onChange={(e) => setOrg({ ...org, targetMarkets: e.target.value })}
              required
            />
            <Input
              label="Default Daily Outreach Email Limit"
              type="number"
              value={org.dailyEmailLimit}
              onChange={(e) => setOrg({ ...org, dailyEmailLimit: Number(e.target.value) })}
            />
            <div className="pt-4 border-t flex justify-end">
              <Button type="submit">Save Organization Settings</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Gmail Integration */}
      {activeTab === 'gmail' && (
        <Card title="Gmail API Integration Status">
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Gmail Service Connected</p>
                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">Active Account: export.manager@apexindustrialexports.com</p>
              </div>
              <Button variant="outline">Disconnect Account</Button>
            </div>
            <p className="text-slate-500 leading-relaxed">
              ExportFlow uses the official Google Gmail API for sending approved outreach campaign emails directly from your business account.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 3: AI Provider */}
      {activeTab === 'ai' && (
        <Card title="AI Classifier & Email Personalization Engine">
          <div className="space-y-4 text-xs">
            <Select
              label="Active AI Provider Engine *"
              value={aiSettings.provider}
              onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
              options={[
                { label: 'Mock AI Engine (Active Dev Mode)', value: 'mock' },
                { label: 'Google Gemini 1.5 Flash / Pro', value: 'gemini' },
                { label: 'OpenAI GPT-4o / GPT-4 Mini', value: 'openai' },
              ]}
            />
            <Input
              label="API Key (Optional for production key configuration)"
              type="password"
              value={aiSettings.apiKey}
              onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
              placeholder="sk-..."
            />
            <div className="pt-4 border-t flex justify-end">
              <Button onClick={() => showToast('AI Settings saved', 'success')}>Save AI Configuration</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Team Users */}
      {activeTab === 'users' && (
        <Card title="Team Roles & Access Control">
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-semibold uppercase">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-2.5 px-3 font-semibold">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold">{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
