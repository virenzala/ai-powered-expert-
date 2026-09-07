import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { EmailTemplate } from '../types';
import { Plus, Edit, Trash2, Code } from 'lucide-react';
import api from '../services/api';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    subject: '',
    body: '',
    product: '',
    language: 'English',
  });

  const { showToast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/templates');
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (err: any) {
      showToast('Failed to load email templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate._id}`, formData);
        showToast('Template updated', 'success');
      } else {
        await api.post('/templates', formData);
        showToast('Template created', 'success');
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      showToast('Failed to save template', 'error');
    }
  };

  const insertVariable = (varName: string) => {
    setFormData((prev: any) => ({
      ...prev,
      body: prev.body + ` {{${varName}}}`,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reusable Email Templates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build standardized B2B export outreach templates with dynamic place-holders for company, contact, and country.
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingTemplate(null);
            setFormData({ name: '', subject: '', body: '', product: '', language: 'English' });
            setIsModalOpen(true);
          }}
        >
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => (
          <Card key={tmpl._id} title={tmpl.name}>
            <div className="space-y-3 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Subject: <span className="font-normal text-slate-600 dark:text-slate-300">{tmpl.subject}</span>
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {tmpl.body}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">Language: {tmpl.language}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Edit className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setEditingTemplate(tmpl);
                      setFormData(tmpl);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Email Template'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Template Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g. European OEM Introduction"
          />
          <Input
            label="Subject Line *"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            placeholder="Export Supply of {{product_name}} for {{company_name}}"
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Body Text *
              </label>
              <div className="flex gap-1">
                {['company_name', 'contact_name', 'country', 'product_name', 'industry'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded border hover:bg-blue-100 font-mono"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={8}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-sans"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
