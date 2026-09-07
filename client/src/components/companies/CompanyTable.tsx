import React from 'react';
import { Company } from '../../types';
import { Badge } from '../common/Badge';
import { Eye, Edit, Trash2, Globe, Building } from 'lucide-react';

export interface CompanyTableProps {
  companies: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/60 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4">Company Name</th>
              <th className="py-3.5 px-4">Country</th>
              <th className="py-3.5 px-4">Industry Sector</th>
              <th className="py-3.5 px-4">Primary Product</th>
              <th className="py-3.5 px-4">Contacts</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No company records found.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <span
                        onClick={() => onView(c)}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer block text-sm"
                      >
                        {c.companyName}
                      </span>
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-blue-500 text-[11px] font-mono flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="w-3 h-3" /> {c.website}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{c.country}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.industry}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{c.productInterest || 'Industrial Components'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      <Building className="w-3 h-3 text-slate-400" /> {c.contactCount || 0} Contacts
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={c.status === 'Active' ? 'valid' : 'invalid'}>{c.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(c._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
