import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { EmailTemplate } from '../../types';
import api from '../../services/api';

export interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [product, setProduct] = useState<string>('Industrial Valves & Actuators');
  const [targetCountry, setTargetCountry] = useState<string>('Germany');
  const [templateId, setTemplateId] = useState<string>('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [dailyLimit, setDailyLimit] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/templates').then((res) => {
        if (res.data.success) {
          setTemplates(res.data.data);
          if (res.data.data.length > 0) setTemplateId(res.data.data[0]._id);
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/campaigns', {
        name,
        product,
        targetCountries: [targetCountry],
        templateId,
        dailySendingLimit: dailyLimit,
      });
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
      title="Create Export Outreach Campaign"
      subtitle="Step-by-step campaign setup with lead segmentation & safety checks"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Campaign Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Q3 Germany Valves Outreach"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Export Product *"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            options={[
              { label: 'Industrial Valves & Actuators', value: 'Industrial Valves & Actuators' },
              { label: 'Submersible Slurry Pumps', value: 'Submersible Slurry Pumps' },
              { label: 'High Voltage Transformers', value: 'High Voltage Transformers' },
              { label: 'CNC Machine Components & Gears', value: 'CNC Machine Components & Gears' },
              { label: 'Hydraulic Fittings & Flanges', value: 'Hydraulic Fittings & Flanges' },
            ]}
          />
          <Select
            label="Target Market / Country *"
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value)}
            options={[
              { label: 'Germany', value: 'Germany' },
              { label: 'USA', value: 'USA' },
              { label: 'UAE', value: 'UAE' },
              { label: 'Japan', value: 'Japan' },
              { label: 'Brazil', value: 'Brazil' },
            ]}
          />
        </div>

        <Select
          label="Select Email Template *"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          options={templates.map((t) => ({ label: `${t.name} (${t.language})`, value: t._id }))}
        />

        <Input
          label="Daily Sending Limit (Gmail Safeguard) *"
          type="number"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(Number(e.target.value))}
          min={1}
          max={500}
        />

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Campaign Draft
          </Button>
        </div>
      </form>
    </Modal>
  );
};
