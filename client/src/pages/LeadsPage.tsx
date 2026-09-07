import React, { useState, useEffect } from 'react';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFilters, LeadFilterState } from '../components/leads/LeadFilters';
import { LeadModal } from '../components/leads/LeadModal';
import { LeadDetailDrawer } from '../components/leads/LeadDetailDrawer';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { Lead } from '../types';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<LeadFilterState>({
    search: '',
    country: '',
    industry: '',
    buyerType: '',
    validationStatus: '',
    leadStatus: '',
    leadSource: '',
    sortBy: 'newest',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 15 };
      if (filters.search) params.search = filters.search;
      if (filters.country) params.country = filters.country;
      if (filters.industry) params.industry = filters.industry;
      if (filters.buyerType) params.buyerType = filters.buyerType;
      if (filters.validationStatus) params.validationStatus = filters.validationStatus;
      if (filters.leadStatus) params.leadStatus = filters.leadStatus;
      if (filters.leadSource) params.leadSource = filters.leadSource;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const res = await api.get('/leads', { params });
      if (res.data.success) {
        setLeads(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err: any) {
      showToast('Failed to load buyer leads', 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, filters]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAllToggle = () => {
    if (leads.every((l) => selectedIds.includes(l._id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l._id));
    }
  };

  const handleSaveLead = async (data: any) => {
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, data);
        showToast('Buyer lead updated', 'success');
      } else {
        await api.post('/leads', data);
        showToast('Buyer lead created & validated', 'success');
      }
      fetchLeads();
    } catch (err: any) {
      showToast('Error saving lead', 'error', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this buyer lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      showToast('Lead deleted', 'info');
      fetchLeads();
    } catch (err: any) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const handleBulkValidate = async () => {
    try {
      const res = await api.post('/leads/validate-bulk', { leadIds: selectedIds });
      showToast('Bulk Validation Complete', 'success', res.data.message);
      setSelectedIds([]);
      fetchLeads();
    } catch (err: any) {
      showToast('Bulk validation failed', 'error');
    }
  };

  const handleBulkClassify = async () => {
    try {
      const res = await api.post('/leads/classify-bulk', { leadIds: selectedIds });
      showToast('AI Scoring Complete', 'success', res.data.message);
      setSelectedIds([]);
      fetchLeads();
    } catch (err: any) {
      showToast('Bulk AI classification failed', 'error');
    }
  };

  const handleBulkSuppress = async () => {
    try {
      await api.post('/leads/bulk-action', { leadIds: selectedIds, action: 'suppress' });
      showToast('Leads Suppressed', 'warning', `Added ${selectedIds.length} leads to global suppression list.`);
      setSelectedIds([]);
      fetchLeads();
    } catch (err: any) {
      showToast('Bulk suppression failed', 'error');
    }
  };

  const exportCSV = () => {
    let csv = 'Company,Contact,Email,Country,Industry,Validation,AIScore\n';
    leads.forEach((l) => {
      csv += `"${l.companyName}","${l.contactName}","${l.email}","${l.country}","${l.industry}","${l.validationStatus}","${l.aiScore || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyer_leads_export_${Date.now()}.csv`;
    a.click();
    showToast('Exported CSV file', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">International Buyer Leads</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, validate, classify, and qualify target export buyers for campaign outreach.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => navigate('/import')}>
            Import List
          </Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingLead(null);
              setIsModalOpen(true);
            }}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <LeadFilters
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: '',
            country: '',
            industry: '',
            buyerType: '',
            validationStatus: '',
            leadStatus: '',
            leadSource: '',
            sortBy: 'newest',
          })
        }
      />

      {/* Main Data Table */}
      <LeadTable
        leads={leads}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAllToggle={handleSelectAllToggle}
        onViewLead={(lead) => {
          setActiveLeadId(lead._id);
          setIsDrawerOpen(true);
        }}
        onEditLead={(lead) => {
          setEditingLead(lead);
          setIsModalOpen(true);
        }}
        onDeleteLead={handleDeleteLead}
        onBulkValidate={handleBulkValidate}
        onBulkClassify={handleBulkClassify}
        onBulkSuppress={handleBulkSuppress}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      {/* Add / Edit Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        initialData={editingLead}
      />

      {/* Profile Detail Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        leadId={activeLeadId}
        onRefresh={fetchLeads}
      />
    </div>
  );
};
