import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { FollowUp } from '../types';
import { CalendarCheck, CheckCircle2, Plus, Clock } from 'lucide-react';
import api from '../services/api';

export const FollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    leadId: '',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
    priority: 'High',
  });

  const { showToast } = useToast();

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/followups');
      if (res.data.success) {
        setFollowUps(res.data.data);
      }
    } catch (err: any) {
      showToast('Failed to load follow-ups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await api.patch(`/followups/${id}/complete`);
      showToast('Follow-up marked complete', 'success');
      fetchFollowUps();
    } catch (err: any) {
      showToast('Failed to complete follow-up', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Follow-up Task Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Schedule and track sales follow-ups, inquiry calls, and formal export quote submissions.</p>
        </div>
      </div>

      <div className="space-y-4">
        {followUps.map((f) => (
          <Card key={f._id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{f.title}</h4>
                  <Badge variant={f.priority === 'High' ? 'risky' : 'neutral'}>{f.priority} Priority</Badge>
                  <Badge variant={f.status === 'Completed' ? 'valid' : 'high'}>{f.status}</Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Buyer Lead: <strong>{f.leadId?.contactName}</strong> ({f.leadId?.companyName} • {f.leadId?.country})
                </p>
                {f.notes && <p className="text-slate-500 italic mt-1">{f.notes}</p>}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-500 font-mono text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Due: {new Date(f.dueDate).toLocaleDateString()}
                </span>
                {f.status !== 'Completed' && (
                  <Button size="sm" variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleComplete(f._id)}>
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
