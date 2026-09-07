import React from 'react';
import { Search, RotateCcw, ArrowUpDown } from 'lucide-react';
import { Button } from '../common/Button';

export interface LeadFilterState {
  search: string;
  country: string;
  industry: string;
  buyerType: string;
  validationStatus: string;
  leadStatus: string;
  leadSource: string;
  sortBy: string;
}

export interface LeadFiltersProps {
  filters: LeadFilterState;
  onChange: (filters: LeadFilterState) => void;
  onReset: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onChange, onReset }) => {
  const handleInputChange = (field: keyof LeadFilterState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Search by company, contact name, or email..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Country Filter */}
        <select
          value={filters.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
        >
          <option value="">All Target Countries</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="UAE">UAE</option>
          <option value="Japan">Japan</option>
          <option value="Sweden">Sweden</option>
          <option value="USA">USA</option>
        </select>

        {/* Industry Filter */}
        <select
          value={filters.industry}
          onChange={(e) => handleInputChange('industry', e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
        >
          <option value="">All Industries</option>
          <option value="Industrial Equipment">Industrial Equipment</option>
          <option value="Industrial Machinery">Industrial Machinery</option>
          <option value="Engineering & Controls">Engineering & Controls</option>
          <option value="Electrical Equipment">Electrical Equipment</option>
          <option value="Chemical Processing">Chemical Processing</option>
        </select>

        {/* Buyer Type Filter */}
        <select
          value={filters.buyerType}
          onChange={(e) => handleInputChange('buyerType', e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
        >
          <option value="">All Buyer Types</option>
          <option value="Importer">Importer</option>
          <option value="Distributor">Distributor</option>
          <option value="Wholesaler">Wholesaler</option>
          <option value="Manufacturer">Manufacturer</option>
        </select>

        {/* Source Filter */}
        <select
          value={filters.leadSource}
          onChange={(e) => handleInputChange('leadSource', e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
        >
          <option value="">All Data Sources</option>
          <option value="API Discovery">API Discovery</option>
          <option value="Apollo.io B2B Database">Apollo.io B2B Database</option>
          <option value="Google Places Business Discovery">Google Places Discovery</option>
          <option value="Development Mock B2B Registry">Mock B2B Registry</option>
          <option value="CSV Import">CSV Import</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.leadStatus}
          onChange={(e) => handleInputChange('leadStatus', e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
        >
          <option value="">All Lead Statuses</option>
          <option value="New">New</option>
          <option value="Imported">Imported</option>
          <option value="Validating">Validating</option>
          <option value="Valid">Valid</option>
          <option value="Contacted">Contacted</option>
          <option value="Suppressed">Suppressed</option>
        </select>

        {/* Sort Filter */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleInputChange('sortBy', e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="companyName">Sort: Company A-Z</option>
          <option value="country">Sort: Country A-Z</option>
          <option value="aiScore">Sort: AI Score High-Low</option>
        </select>

        {/* Reset Button */}
        <Button size="sm" variant="ghost" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
