import React, { useState, useEffect } from 'react';
import { CampaignTable } from '../components/campaigns/CampaignTable';
import { CampaignWizardModal } from '../components/campaigns/CampaignWizardModal';
import { CampaignApprovalModal } from '../components/campaigns/CampaignApprovalModal';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Campaign } from '../types';
import { Plus, Send } from 'lucide-react';
import api from '../services/api';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [approvalCampaign, setApprovalCampaign] = useState<Campaign | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState<boolean>(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (err: any) {
      showToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleGenerateDrafts = async (id: string) => {
    try {
      const res = await api.post(`/campaigns/${id}/generate-drafts`);
      showToast('AI Drafts Generated', 'success', res.data.message);
      fetchCampaigns();
    } catch (err: any) {
      showToast('Draft generation failed', 'error');
    }
  };

  const handleStart = async (id: string) => {
    try {
      const res = await api.post(`/campaigns/${id}/start`);
      showToast('Campaign Execution Finished', 'success', `Sent ${res.data.result?.sentCount || 0} emails.`);
      fetchCampaigns();
    } catch (err: any) {
      showToast('Campaign execution failed', 'error', err.response?.data?.message || err.message);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/pause`);
      showToast('Campaign Paused', 'info');
      fetchCampaigns();
    } catch (err: any) {
      showToast('Pause failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Outreach Campaigns</h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured email campaign management with manager approval gate and Gmail dispatch safeguards.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsWizardOpen(true)}>
          Create Campaign
        </Button>
      </div>

      <CampaignTable
        campaigns={campaigns}
        onView={(c) => alert(`Campaign: ${c.name}\nStatus: ${c.status}`)}
        onGenerateDrafts={handleGenerateDrafts}
        onApprove={(c) => {
          setApprovalCampaign(c);
          setIsApprovalOpen(true);
        }}
        onStart={handleStart}
        onPause={handlePause}
        userRole={user?.role}
      />

      <CampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={fetchCampaigns}
      />

      <CampaignApprovalModal
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        campaign={approvalCampaign}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
};
