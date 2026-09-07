import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  Mail,
  Bot,
  RefreshCw,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { LeadDetailDrawer } from '../components/leads/LeadDetailDrawer';
import { Lead } from '../types';

export const FindBuyersPage: React.FC = () => {
  const [product, setProduct] = useState<string>('Industrial Machinery');
  const [country, setCountry] = useState<string>('Germany');
  const [industry, setIndustry] = useState<string>('Industrial Equipment');
  const [buyerType, setBuyerType] = useState<string>('Importer');
  const [contactRole, setContactRole] = useState<string>('Procurement Manager');
  const [keywords, setKeywords] = useState<string>('industrial machinery importer');

  const [loading, setLoading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { showToast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!product.trim() || !country.trim() || !industry.trim()) {
      showToast('Product, Target Country, and Industry are required.', 'warning');
      return;
    }

    setLoading(true);
    setErrorReason(null);
    setProgressStage('Searching buyer database...');

    // Progress stage updates corresponding to actual backend steps
    const timer1 = setTimeout(() => setProgressStage('Finding companies...'), 500);
    const timer2 = setTimeout(() => setProgressStage('Finding contacts...'), 1000);
    const timer3 = setTimeout(() => setProgressStage('Checking duplicates...'), 1500);
    const timer4 = setTimeout(() => setProgressStage('Saving new buyers...'), 2000);

    try {
      const res = await api.post('/buyer-discovery/search', {
        product: product.trim(),
        country: country.trim(),
        industry: industry.trim(),
        buyerType: buyerType.trim(),
        contactRole: contactRole.trim(),
        keywords: keywords.trim(),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      if (res.data.success) {
        setResults(res.data);
        showToast(
          `Discovery Complete! Found ${res.data.summary.totalFound} buyers (${res.data.summary.newLeads} new added).`,
          'success'
        );
      } else {
        throw new Error(res.data.reason || res.data.message || 'Discovery operation failed');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      const msg = err.response?.data?.reason || err.response?.data?.message || err.message || 'Buyer discovery failed';
      setErrorReason(msg);
      showToast('Buyer discovery failed', 'error', msg);
    } finally {
      setLoading(false);
      setProgressStage('');
    }
  };

  const handleValidate = async (leadId: string) => {
    try {
      const res = await api.post(`/leads/${leadId}/validate`);
      if (res.data.success) {
        showToast('Email deliverability validated', 'success');
        if (results && results.leads) {
          setResults({
            ...results,
            leads: results.leads.map((l: any) =>
              l._id === leadId ? { ...l, validationStatus: res.data.validationStatus } : l
            ),
          });
        }
      }
    } catch (err: any) {
      showToast('Validation failed', 'error', err.message);
    }
  };

  const handleClassify = async (leadId: string) => {
    try {
      const res = await api.post(`/leads/${leadId}/classify`);
      if (res.data.success) {
        showToast('AI Lead Qualification updated', 'success');
        if (results && results.leads) {
          setResults({
            ...results,
            leads: results.leads.map((l: any) =>
              l._id === leadId ? { ...l, aiScore: res.data.aiScore, aiClassification: res.data.classification } : l
            ),
          });
        }
      }
    } catch (err: any) {
      showToast('AI classification failed', 'error', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Find International Buyers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              API Discovery Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discover international buyers, validate target decision-makers, and auto-persist B2B leads to database.
          </p>
        </div>

        {results && (
          <Badge variant={results.mode === 'mock' ? 'medium' : 'valid'}>
            {results.mode === 'mock'
              ? 'DEVELOPMENT / MOCK MODE'
              : `PROVIDER: ${results.mode.toUpperCase()}`}
          </Badge>
        )}
      </div>

      {/* Mode Information Banner when Mock Mode Active */}
      {(!results || results.mode === 'mock') && (
        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>DEVELOPMENT / MOCK MODE ACTIVE:</strong> APOLLO_API_KEY is not configured in environment. Displaying realistic synthetic industrial export buyer records.
            </span>
          </div>
        </div>
      )}

      {/* Discovery Form Card */}
      <Card title="Configure Buyer Search Parameters">
        <form onSubmit={handleSearch} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Product *"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Industrial Machinery"
              required
            />
            <Input
              label="Target Country *"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Germany"
              required
            />
            <Select
              label="Industry *"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={[
                { label: 'Industrial Equipment', value: 'Industrial Equipment' },
                { label: 'Industrial Machinery', value: 'Industrial Machinery' },
                { label: 'Engineering & Controls', value: 'Engineering & Controls' },
                { label: 'Oilfield & Industrial Supplies', value: 'Oilfield & Industrial Supplies' },
                { label: 'Chemical Processing', value: 'Chemical Processing' },
                { label: 'Electrical Equipment', value: 'Electrical Equipment' },
              ]}
            />
            <Select
              label="Buyer Type *"
              value={buyerType}
              onChange={(e) => setBuyerType(e.target.value)}
              options={[
                { label: 'Importer / Distributor', value: 'Importer' },
                { label: 'Wholesaler / Stockist', value: 'Wholesaler' },
                { label: 'OEM Manufacturer', value: 'Manufacturer' },
                { label: 'Engineering Contractor', value: 'Contractor' },
              ]}
            />
            <Select
              label="Contact Role *"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              options={[
                { label: 'Procurement Manager', value: 'Procurement Manager' },
                { label: 'VP / Director of Purchasing', value: 'Purchasing Director' },
                { label: 'Head of Supply Chain', value: 'Head of Supply Chain' },
                { label: 'Category Buyer', value: 'Category Buyer' },
              ]}
            />
            <Input
              label="Keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. industrial machinery importer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={loading} icon={<Search className="w-4 h-4" />}>
              FIND INTERNATIONAL BUYERS
            </Button>
          </div>
        </form>

        {/* Real Progress Stage Display */}
        {loading && (
          <div className="mt-4 p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{progressStage}</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </Card>

      {/* Error handling card */}
      {errorReason && !loading && (
        <Card>
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">Buyer discovery failed</h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Reason: {errorReason}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => handleSearch()}
              >
                Retry Search
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">BUYERS FOUND</h2>
            <span className="text-xs text-slate-500 font-mono">
              Provider Mode: <strong>{results.mode.toUpperCase()}</strong>
            </span>
          </div>

          {/* Stat Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm">
              <span className="text-2xl font-bold block">{results.summary.totalFound}</span>
              <span className="text-xs text-slate-400">Total Found</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <span className="text-2xl font-bold block">{results.summary.newLeads}</span>
              <span className="text-xs font-semibold">New Leads</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 p-4 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
              <span className="text-2xl font-bold block">{results.summary.existingLeads}</span>
              <span className="text-xs font-semibold">Existing Leads</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-2xl font-bold block">{results.summary.errors}</span>
              <span className="text-xs font-semibold">Errors</span>
            </div>
          </div>

          {/* Results Table */}
          <Card title={`Discovered International Buyers (${results.leads.length} Records)`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-900/50">
                    <th className="p-3">Company</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Job Title</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Industry</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {results.leads.map((lead: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                      <td className="p-3 font-medium">
                        <div className="text-slate-900 dark:text-slate-100 font-semibold">{lead.companyName}</div>
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-500 hover:underline"
                          >
                            {lead.website}
                          </a>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{lead.contactName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{lead.jobTitle || 'Procurement Manager'}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{lead.country}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{lead.industry}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{lead.productInterest || product}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{lead.email}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{lead.leadSource || 'API Discovery'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.existing ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {lead.existing ? 'EXISTING' : 'NEW'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                            View
                          </Button>
                          {lead._id && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                                onClick={() => handleValidate(lead._id)}
                              >
                                Validate
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={<Bot className="w-3.5 h-3.5" />}
                                onClick={() => handleClassify(lead._id)}
                              >
                                Classify
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                            onClick={() => (window.location.href = '/campaigns')}
                          >
                            Add to Campaign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Profile Detail Drawer */}
      <LeadDetailDrawer
        isOpen={!!selectedLead}
        leadId={selectedLead?._id || null}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
};
