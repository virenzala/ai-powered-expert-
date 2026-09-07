import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Lead } from '../../types';

export interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>({
    companyName: '',
    contactName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    country: 'Germany',
    industry: 'Industrial Machinery',
    productInterest: 'Industrial Valves',
    buyerType: 'Importer',
    companyDescription: '',
    notes: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        companyName: '',
        contactName: '',
        jobTitle: '',
        email: '',
        phone: '',
        website: '',
        country: 'Germany',
        industry: 'Industrial Machinery',
        productInterest: 'Industrial Valves',
        buyerType: 'Importer',
        companyDescription: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
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
      title={initialData ? 'Edit Buyer Lead' : 'Add New Buyer Lead'}
      subtitle="Enter buyer details for email validation and AI qualification"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
            placeholder="e.g. Hanseatic Maschinenbau GmbH"
          />
          <Input
            label="Contact Person Name *"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            required
            placeholder="e.g. Dr. Klaus Becker"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="e.g. Head of Global Procurement"
          />
          <Input
            label="Business Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="k.becker@company.de"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+49 40 8912 3400"
          />
          <Input
            label="Company Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://company.de"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Target Country *"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            options={[
              { label: 'Germany', value: 'Germany' },
              { label: 'USA', value: 'USA' },
              { label: 'UAE', value: 'UAE' },
              { label: 'Japan', value: 'Japan' },
              { label: 'Brazil', value: 'Brazil' },
              { label: 'Singapore', value: 'Singapore' },
            ]}
          />
          <Select
            label="Industry Sector *"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            options={[
              { label: 'Industrial Machinery', value: 'Industrial Machinery' },
              { label: 'Engineering & Controls', value: 'Engineering & Controls' },
              { label: 'Electrical Equipment', value: 'Electrical Equipment' },
              { label: 'Manufacturing Equipment', value: 'Manufacturing Equipment' },
              { label: 'Industrial Supplies', value: 'Industrial Supplies' },
            ]}
          />
          <Select
            label="Buyer Category"
            value={formData.buyerType}
            onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })}
            options={[
              { label: 'Importer', value: 'Importer' },
              { label: 'Distributor', value: 'Distributor' },
              { label: 'Wholesaler', value: 'Wholesaler' },
              { label: 'Manufacturer', value: 'Manufacturer' },
              { label: 'Retailer', value: 'Retailer' },
            ]}
          />
        </div>

        <Input
          label="Product Interest"
          value={formData.productInterest}
          onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
          placeholder="e.g. Industrial Valves & Actuators"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Company Description
          </label>
          <textarea
            rows={3}
            value={formData.companyDescription}
            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            placeholder="Brief background about company business..."
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Save Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
};
