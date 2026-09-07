import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../context/ToastContext';
import { Suppression } from '../types';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

export const SuppressionPage: React.FC = () => {
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [reason, setReason] = useState<string>('Opted out');

  const { showToast } = useToast();

  const fetchSuppressions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppression');
      if (res.data.success) {
        setSuppressions(res.data.data);
      }
    } catch (err: any) {
      showToast('Failed to load suppression list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppressions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppression', { email, company, reason });
      showToast('Added to suppression list', 'warning');
      setIsModalOpen(false);
      setEmail('');
      setCompany('');
      fetchSuppressions();
    } catch (err: any) {
      showToast('Failed to suppress email', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/suppression/${id}`);
      showToast('Removed from suppression list', 'info');
      fetchSuppressions();
    } catch (err: any) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Global Suppression & Opt-Out List</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-send compliance safety engine. Any contact in this list is automatically blocked from receiving outreach emails.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Add Suppressed Email
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/60 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Suppressed Email</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suppressions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No suppressed emails found.
                  </td>
                </tr>
              ) : (
                suppressions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{s.email}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{s.company || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                        {s.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{s.source}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Suppress Email Address">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Select
            label="Suppression Reason *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { label: 'Opted out', value: 'Opted out' },
              { label: 'Invalid', value: 'Invalid' },
              { label: 'Do not contact', value: 'Do not contact' },
              { label: 'Compliance restriction', value: 'Compliance restriction' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Suppress Email
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
