import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { useToast } from '../context/ToastContext';
import { UploadCloud, CheckCircle2, FileSpreadsheet, AlertTriangle, ArrowRight, Download, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const ImportPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<any>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    companyName: '',
    contactName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    state: '',
    city: '',
    industry: '',
    productInterest: '',
    buyerType: '',
    companyDescription: '',
    leadSource: '',
    sourceUrl: '',
  });
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'flag' | 'overwrite'>('skip');
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a CSV file first', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUploadData(res.data);
        setColumnMapping({
          companyName: res.data.suggestedMapping.companyName || res.data.headers[0] || '',
          contactName: res.data.suggestedMapping.contactName || res.data.headers[1] || '',
          jobTitle: res.data.suggestedMapping.jobTitle || '',
          email: res.data.suggestedMapping.email || res.data.headers[2] || '',
          phone: res.data.suggestedMapping.phone || '',
          website: res.data.suggestedMapping.website || '',
          country: res.data.suggestedMapping.country || res.data.headers[3] || '',
          state: '',
          city: '',
          industry: res.data.suggestedMapping.industry || res.data.headers[4] || '',
          productInterest: res.data.suggestedMapping.productInterest || '',
          buyerType: '',
          companyDescription: '',
          leadSource: '',
          sourceUrl: '',
        });
        setStep(2);
        showToast('CSV uploaded & headers parsed', 'success');
      }
    } catch (err: any) {
      showToast('Upload failed', 'error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImport = async () => {
    if (!columnMapping.email || !columnMapping.companyName) {
      showToast('Please map Company Name and Email fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/import/process', {
        filePath: uploadData.filePath,
        fileName: uploadData.fileName,
        mapping: columnMapping,
        duplicateStrategy,
      });

      if (res.data.success) {
        setImportResult(res.data.job);
        setStep(3);
        showToast('CSV Lead Import Completed', 'success');
      }
    } catch (err: any) {
      showToast('Import processing failed', 'error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CSV/Excel Lead Import Wizard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Import international buyer lists with automatic column mapping, duplicate detection, email validation, and AI scoring.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-3 rounded-xl border text-center text-xs font-semibold ${step === 1 ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          1. Upload CSV File
        </div>
        <div className={`p-3 rounded-xl border text-center text-xs font-semibold ${step === 2 ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          2. Map Columns & Duplicates
        </div>
        <div className={`p-3 rounded-xl border text-center text-xs font-semibold ${step === 3 ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          3. Import Summary Report
        </div>
      </div>

      {/* STEP 1: Upload */}
      {step === 1 && (
        <Card title="Upload International Buyer CSV File">
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
            <UploadCloud className="w-12 h-12 mx-auto text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Select or drop CSV file here</p>
              <p className="text-xs text-slate-500 mt-1">Supports standard CSV format with headers</p>
            </div>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload-input" />
            <div className="flex justify-center gap-3">
              <label htmlFor="csv-upload-input">
                <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 border border-blue-500/30 rounded-lg hover:bg-blue-50 cursor-pointer">
                  Browse File
                </span>
              </label>
              {file && (
                <Button isLoading={loading} onClick={handleUpload} icon={<ArrowRight className="w-4 h-4" />}>
                  Upload & Preview ({file.name})
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 2 && uploadData && (
        <Card title="Map Columns & Configure Duplicate Resolution">
          <div className="space-y-6 text-xs">
            <p className="text-slate-500">
              Match columns from your uploaded CSV file (<strong>{uploadData.fileName}</strong>) to ExportFlow fields:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Company Name *"
                value={columnMapping.companyName}
                onChange={(e) => setColumnMapping({ ...columnMapping, companyName: e.target.value })}
                options={uploadData.headers.map((h: string) => ({ label: h, value: h }))}
              />
              <Select
                label="Contact Name *"
                value={columnMapping.contactName}
                onChange={(e) => setColumnMapping({ ...columnMapping, contactName: e.target.value })}
                options={uploadData.headers.map((h: string) => ({ label: h, value: h }))}
              />
              <Select
                label="Business Email Address *"
                value={columnMapping.email}
                onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                options={uploadData.headers.map((h: string) => ({ label: h, value: h }))}
              />
              <Select
                label="Job Title / Role"
                value={columnMapping.jobTitle}
                onChange={(e) => setColumnMapping({ ...columnMapping, jobTitle: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Phone Number"
                value={columnMapping.phone}
                onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Company Website URL"
                value={columnMapping.website}
                onChange={(e) => setColumnMapping({ ...columnMapping, website: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Target Country *"
                value={columnMapping.country}
                onChange={(e) => setColumnMapping({ ...columnMapping, country: e.target.value })}
                options={uploadData.headers.map((h: string) => ({ label: h, value: h }))}
              />
              <Select
                label="State / Region"
                value={columnMapping.state}
                onChange={(e) => setColumnMapping({ ...columnMapping, state: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="City"
                value={columnMapping.city}
                onChange={(e) => setColumnMapping({ ...columnMapping, city: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Industry Sector *"
                value={columnMapping.industry}
                onChange={(e) => setColumnMapping({ ...columnMapping, industry: e.target.value })}
                options={uploadData.headers.map((h: string) => ({ label: h, value: h }))}
              />
              <Select
                label="Product Interest"
                value={columnMapping.productInterest}
                onChange={(e) => setColumnMapping({ ...columnMapping, productInterest: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Buyer Category"
                value={columnMapping.buyerType}
                onChange={(e) => setColumnMapping({ ...columnMapping, buyerType: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Company Description"
                value={columnMapping.companyDescription}
                onChange={(e) => setColumnMapping({ ...columnMapping, companyDescription: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Lead Source"
                value={columnMapping.leadSource}
                onChange={(e) => setColumnMapping({ ...columnMapping, leadSource: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
              <Select
                label="Source URL"
                value={columnMapping.sourceUrl}
                onChange={(e) => setColumnMapping({ ...columnMapping, sourceUrl: e.target.value })}
                options={[{ label: '-- Optional --', value: '' }, ...uploadData.headers.map((h: string) => ({ label: h, value: h }))]}
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Duplicate Prevention Strategy</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'skip'}
                    onChange={() => setDuplicateStrategy('skip')}
                  />
                  <span>Skip Duplicate Records</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'flag'}
                    onChange={() => setDuplicateStrategy('flag')}
                  />
                  <span>Import & Flag Duplicates</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button isLoading={loading} icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleProcessImport}>
                Execute Import & AI Qualification
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Summary Report */}
      {step === 3 && importResult && (
        <Card title="Import Processing Complete">
          <div className="space-y-6 text-xs text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Successfully Imported {importResult.importedCount} Buyer Leads
              </h3>
              <p className="text-slate-500 mt-1">
                Processed file: <strong>{importResult.fileName}</strong>
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 divide-y divide-slate-200 dark:divide-slate-800 text-left font-medium">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Total Rows</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{importResult.totalRows}</span>
              </div>
              <div className="flex justify-between py-2 text-emerald-600 dark:text-emerald-400">
                <span>Imported</span>
                <span className="font-bold">{importResult.importedCount}</span>
              </div>
              <div className="flex justify-between py-2 text-amber-600 dark:text-amber-400">
                <span>Duplicates</span>
                <span className="font-bold">{importResult.duplicateCount}</span>
              </div>
              <div className="flex justify-between py-2 text-rose-600 dark:text-rose-400">
                <span>Invalid</span>
                <span className="font-bold">{importResult.invalidCount}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-500">
                <span>Skipped</span>
                <span className="font-bold">{importResult.skippedCount}</span>
              </div>
            </div>

            {/* Row-Level Errors & Duplicates Detailed Inspection */}
            {importResult.jobErrors && importResult.jobErrors.length > 0 && (
              <div className="text-left space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Row-Level Audit Log ({importResult.jobErrors.length} Issues / Duplicates)
                  </h4>
                  <a
                    href={`/api/import/jobs/${importResult._id}/errors`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Report CSV
                  </a>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Company</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Exact Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                      {importResult.jobErrors.map((err: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">Row {err.row}</td>
                          <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-slate-100">{err.company || 'N/A'}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{err.email || 'N/A'}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded font-sans text-[10px] font-bold ${
                                err.status === 'Duplicate' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {err.status || 'Invalid'}
                            </span>
                          </td>
                          <td className="p-2.5 font-sans text-slate-500">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Import Another File
              </Button>
              <Button onClick={() => (window.location.href = '/leads')}>View Imported Leads</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
