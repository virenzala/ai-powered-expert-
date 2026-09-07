import React, { useState, useEffect } from 'react';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { Tabs } from '../common/Tabs';
import { Button } from '../common/Button';
import { Lead } from '../../types';
import { Sparkles, Mail, Building, Globe, MapPin, Phone, ShieldCheck, History, Calendar, FileText } from 'lucide-react';
import api from '../../services/api';

export interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
  onRefresh?: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ isOpen, onClose, leadId, onRefresh }) => {
  const [leadDetails, setLeadDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');

  useEffect(() => {
    if (leadId && isOpen) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/leads/${leadId}`);
          if (res.data.success) {
            setLeadDetails(res.data.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [leadId, isOpen]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !leadId) return;
    try {
      const updatedNotes = (leadDetails?.lead?.notes || '') + `\n[${new Date().toLocaleDateString()}] ${newNote}`;
      await api.put(`/leads/${leadId}`, { notes: updatedNotes });
      setLeadDetails({
        ...leadDetails,
        lead: { ...leadDetails.lead, notes: updatedNotes },
      });
      setNewNote('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!leadDetails && loading) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Loading Lead Profile...">
        <div className="p-8 text-center text-slate-400">Fetching lead details...</div>
      </Drawer>
    );
  }

  const lead: Lead = leadDetails?.lead;
  if (!lead) return null;

  const tabs = [
    { id: 'overview', label: 'Company Overview', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'AI Qualification', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'emails', label: 'Outreach History', count: leadDetails?.emailLogs?.length || 0, icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Activity Timeline', count: leadDetails?.activityTimeline?.length || 0, icon: <History className="w-3.5 h-3.5" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead.companyName}
      subtitle={`${lead.contactName} • ${lead.country}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Header Summary Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Validation & AI Classification</p>
            <div className="flex items-center gap-2">
              <Badge variant={lead.validationStatus === 'Valid' ? 'valid' : lead.validationStatus === 'Invalid' ? 'invalid' : 'medium'}>
                {lead.validationStatus || 'Not Yet Processed'}
              </Badge>
              <Badge variant={lead.aiScore !== undefined && lead.aiScore >= 70 ? 'high' : 'medium'}>
                {lead.aiScore !== undefined ? `${lead.aiScore}/100 Score` : 'AI: Not Yet Processed'}
              </Badge>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {lead.buyerType}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Outreach Status</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{lead.outreachStatus}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2">
                  <Building className="w-4 h-4 text-blue-500" /> Company Profile
                </h4>
                <div>
                  <p className="text-slate-400">Company Name</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{lead.companyName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Industry Sector</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{lead.industry}</p>
                </div>
                <div>
                  <p className="text-slate-400">Product Interest</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{lead.productInterest || 'Industrial Components'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.city ? `${lead.city}, ` : ''}{lead.country}
                  </p>
                </div>
                {lead.website && (
                  <div>
                    <p className="text-slate-400">Website</p>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Globe className="w-3.5 h-3.5" /> {lead.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2">
                  <Mail className="w-4 h-4 text-emerald-500" /> Buyer Contact Info
                </h4>
                <div>
                  <p className="text-slate-400">Contact Name</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{lead.contactName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Job Title</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{lead.jobTitle || 'Procurement Manager'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Email Address</p>
                  <p className="font-medium font-mono text-slate-800 dark:text-slate-200">{lead.email}</p>
                </div>
                {lead.phone && (
                  <div>
                    <p className="text-slate-400">Phone</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {lead.companyDescription && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Company Background</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{lead.companyDescription}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Qualification */}
        {activeTab === 'ai' && (
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" /> AI Lead Classification
                </span>
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{lead.aiClassification || 'High Priority Buyer'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100 dark:border-blue-900/30">
                <div>
                  <p className="text-slate-500">Qualification Score</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{lead.aiScore || 85} / 100</p>
                </div>
                <div>
                  <p className="text-slate-500">AI Confidence</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {Math.round((lead.aiConfidence || 0.92) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {lead.aiReasoning && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">AI Reasoning</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{lead.aiReasoning}</p>
              </div>
            )}

            {lead.aiRecommendedApproach && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Recommended Outreach Strategy</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{lead.aiRecommendedApproach}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Outreach Emails */}
        {activeTab === 'emails' && (
          <div className="space-y-3 text-xs">
            {leadDetails.emailLogs?.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No outreach emails sent yet to this buyer.</p>
            ) : (
              leadDetails.emailLogs.map((log: any) => (
                <div key={log._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{log.subject}</span>
                    <Badge variant={log.status === 'Sent' ? 'valid' : 'invalid'}>{log.status}</Badge>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">To: {log.recipient} | Sent: {new Date(log.createdAt).toLocaleString()}</p>
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {log.body}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Activity Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 text-xs">
            {leadDetails.activityTimeline?.map((item: any) => (
              <div key={item._id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.action}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Internal Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Add Note</label>
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter internal sales note..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={handleAddNote}>Save Note</Button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {lead.notes || 'No internal notes added yet.'}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
