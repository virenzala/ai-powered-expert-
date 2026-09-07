import React, { useState } from 'react';
import { Lead } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Eye, Edit, Trash2, CheckCircle, Sparkles, Send, ShieldAlert, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onBulkValidate: () => void;
  onBulkClassify: () => void;
  onBulkSuppress: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onBulkValidate,
  onBulkClassify,
  onBulkSuppress,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const isAllSelected = leads.length > 0 && leads.every((l) => selectedIds.includes(l._id));

  const getValidationVariant = (status: string) => {
    switch (status) {
      case 'Valid': return 'valid';
      case 'Invalid': return 'invalid';
      case 'Risky': return 'risky';
      case 'Disposable': return 'disposable';
      default: return 'neutral';
    }
  };

  const getScoreVariant = (score?: number) => {
    if (!score) return 'neutral';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Bulk Actions Header Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/40 px-6 py-3 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between animate-in fade-in">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            {selectedIds.length} buyer leads selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={onBulkValidate}>
              Validate Emails
            </Button>

            <Button size="sm" variant="outline" icon={<Sparkles className="w-3.5 h-3.5" />} onClick={onBulkClassify}>
              Run AI Scoring
            </Button>

            <Button size="sm" variant="outline" icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-500" />} onClick={onBulkSuppress}>
              Suppress
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/60 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAllToggle}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="py-3.5 px-4">Company & Contact</th>
              <th className="py-3.5 px-4">Country & Industry</th>
              <th className="py-3.5 px-4">Product Interest</th>
              <th className="py-3.5 px-4">Validation</th>
              <th className="py-3.5 px-4">AI Score</th>
              <th className="py-3.5 px-4">Outreach Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No buyer leads found matching filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.includes(lead._id);
                return (
                  <tr
                    key={lead._id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectToggle(lead._id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span
                          onClick={() => onViewLead(lead)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer block text-sm"
                        >
                          {lead.companyName}
                        </span>
                        <span className="text-slate-500 block">
                          {lead.contactName} {lead.jobTitle ? `• ${lead.jobTitle}` : ''}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] block truncate max-w-[200px]">{lead.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{lead.country}</div>
                      <div className="text-slate-500 text-[11px]">{lead.industry}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{lead.productInterest || 'Industrial Goods'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getValidationVariant(lead.validationStatus)}>
                        {lead.validationStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {lead.aiScore !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant={getScoreVariant(lead.aiScore)}>
                            {lead.aiScore}/100
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-medium">{lead.buyerType}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unscored</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                        {lead.outreachStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Page <strong className="text-slate-900 dark:text-slate-100">{currentPage}</strong> of{' '}
          <strong className="text-slate-900 dark:text-slate-100">{totalPages || 1}</strong>
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
