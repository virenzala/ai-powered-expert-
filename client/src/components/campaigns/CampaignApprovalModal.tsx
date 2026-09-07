import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Campaign } from '../../types';
import { CheckCircle2, ShieldCheck, Users, Mail, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export interface CampaignApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSuccess: () => void;
}

export const CampaignApprovalModal: React.FC<CampaignApprovalModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  if (!campaign) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.post(`/campaigns/${campaign._id}/approve`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manager Campaign Approval Gate"
      subtitle="Review recipient list, validation scores, and rate limits before authorizing send"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Campaign Info Summary */}
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100">{campaign.name}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Export Product: <strong>{campaign.product}</strong> | Target: <strong>{campaign.targetCountries?.join(', ')}</strong>
          </p>
        </div>

        {/* Recipient Quality Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Users className="w-4 h-4 mx-auto text-slate-400 mb-1" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{campaign.stats?.totalRecipients || 0}</span>
            <p className="text-[10px] text-slate-500 uppercase">Total Segment</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{campaign.stats?.validRecipients || 0}</span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Valid Contacts</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40">
            <Mail className="w-4 h-4 mx-auto text-rose-500 mb-1" />
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{campaign.stats?.invalidRecipients || 0}</span>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase">Blocked Invalid</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40">
            <ShieldAlert className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{campaign.stats?.suppressedRecipients || 0}</span>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase">Suppressed</p>
          </div>
        </div>

        {/* Manager Verification Notice */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Manager Audit Sign-Off
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
            <li>AI Personalization drafts verified for accuracy (no hallucinated company facts).</li>
            <li>Suppression list applied; opted-out contacts automatically excluded.</li>
            <li>Daily sending rate capped at {campaign.dailySendingLimit} emails per day.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Reject / Revise
          </Button>
          <Button variant="success" icon={<CheckCircle2 className="w-4 h-4" />} isLoading={loading} onClick={handleApprove}>
            Approve Campaign Execution
          </Button>
        </div>
      </div>
    </Modal>
  );
};
