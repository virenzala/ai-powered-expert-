import React, { useState, useEffect } from 'react';
import { CompanyTable } from '../components/companies/CompanyTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../context/ToastContext';
import { Company } from '../types';
import { Plus } from 'lucide-react';
import api from '../services/api';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<any>({
    companyName: '',
    website: '',
    country: 'Germany',
    industry: 'Industrial Machinery',
    productInterest: '',
    description: '',
  });

  const { showToast } = useToast();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err: any) {
      showToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany._id}`, formData);
        showToast('Company updated', 'success');
      } else {
        await api.post('/companies', formData);
        showToast('Company created', 'success');
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      showToast('Failed to save company', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await api.delete(`/companies/${id}`);
      showToast('Company deleted', 'info');
      fetchCompanies();
    } catch (err: any) {
      showToast('Error deleting company', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Buyer Companies</h1>
          <p className="text-xs text-slate-500 mt-1">Manage target international buyer company entities & multi-contact mappings.</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingCompany(null);
            setFormData({ companyName: '', website: '', country: 'Germany', industry: 'Industrial Machinery', productInterest: '', description: '' });
            setIsModalOpen(true);
          }}
        >
          Add Company
        </Button>
      </div>

      <CompanyTable
        companies={companies}
        onView={(c) => alert(`Company Profile: ${c.companyName}\n${c.description || 'No description'}`)}
        onEdit={(c) => {
          setEditingCompany(c);
          setFormData(c);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Edit Company' : 'Add Buyer Company'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Company Name *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Country *"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              options={[
                { label: 'Germany', value: 'Germany' },
                { label: 'USA', value: 'USA' },
                { label: 'UAE', value: 'UAE' },
                { label: 'Japan', value: 'Japan' },
                { label: 'Brazil', value: 'Brazil' },
              ]}
            />
            <Select
              label="Industry *"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={[
                { label: 'Industrial Machinery', value: 'Industrial Machinery' },
                { label: 'Engineering & Controls', value: 'Engineering & Controls' },
                { label: 'Electrical Equipment', value: 'Electrical Equipment' },
                { label: 'Manufacturing Equipment', value: 'Manufacturing Equipment' },
              ]}
            />
          </div>
          <Input
            label="Product Interest"
            value={formData.productInterest}
            onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Company</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
