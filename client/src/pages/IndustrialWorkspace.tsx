import React, { useState, useEffect } from 'react';
import { Factory, Calculator, FileText, BookOpen, ShieldCheck, Search, Sparkles } from 'lucide-react';
import { LandedCostCalculator } from '../components/industrial/LandedCostCalculator';
import { RfqParserModal } from '../components/industrial/RfqParserModal';
import { industrialService } from '../services/industrial.service';
import { HsCodeEntry } from '../types';

export const IndustrialWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'rfq' | 'hscodes' | 'standards'>('calculator');
  const [hsCodes, setHsCodes] = useState<HsCodeEntry[]>([]);
  const [standardsMatrix, setStandardsMatrix] = useState<Record<string, { US: string; EU: string; Global: string }>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRfqModalOpen, setIsRfqModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codes, matrix] = await Promise.all([
          industrialService.getHsCodes(),
          industrialService.getStandardsMatrix(),
        ]);
        setHsCodes(codes);
        setStandardsMatrix(matrix);
      } catch (err) {
        console.error('Failed to load industrial workspace data', err);
      }
    };
    fetchData();
  }, []);

  const filteredHsCodes = hsCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <Factory className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Industrial Outreach Suite</h1>
              <p className="text-xs text-slate-400 mt-1">
                Engineering spec matching, HS Code tariffs, Incoterms landed cost calculator & AI RFQ proposal drafter.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRfqModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI RFQ Reader</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 text-xs font-medium px-4 py-2 rounded-lg transition ${
              activeTab === 'calculator' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Incoterms & Freight Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('hscodes')}
            className={`flex items-center space-x-2 text-xs font-medium px-4 py-2 rounded-lg transition ${
              activeTab === 'hscodes' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>HS Code Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            className={`flex items-center space-x-2 text-xs font-medium px-4 py-2 rounded-lg transition ${
              activeTab === 'standards' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Regional Standards Matrix</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Calculator */}
      {activeTab === 'calculator' && <LandedCostCalculator />}

      {/* Tab Content 2: HS Codes Directory */}
      {activeTab === 'hscodes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Industrial HS Code & Tariff Directory</h3>
              <p className="text-xs text-slate-400">Search international trade tariff codes, typical duty rates, and required export certificates.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search HS Code, category or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHsCodes.map((item) => (
              <div key={item.code} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-500/30">
                    HS {item.code}
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                    Est. Duty: {item.typicalDutyRatePct}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{item.category}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-medium">Primary Standards:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.primaryStandards.map((std) => (
                        <span key={std} className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-medium">Required Certs:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.requiredCertificates.map((cert) => (
                        <span key={cert} className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Regional Standards Matrix */}
      {activeTab === 'standards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Cross-Regional Engineering Standards Matrix</h3>
            <p className="text-xs text-slate-400">Equivalency mapping across North American (ASME/ANSI), European (DIN/EN), and International (ISO/IEC/API) standards.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Equipment Category</th>
                  <th className="py-3 px-4">Americas (US / ANSI)</th>
                  <th className="py-3 px-4">Europe (EU / DIN)</th>
                  <th className="py-3 px-4">Global (ISO / API / IEC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Object.entries(standardsMatrix).map(([cat, map]) => (
                  <tr key={cat} className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 font-bold text-white">{cat}</td>
                    <td className="py-3 px-4 text-blue-400 font-mono">{map.US}</td>
                    <td className="py-3 px-4 text-amber-400 font-mono">{map.EU}</td>
                    <td className="py-3 px-4 text-emerald-400 font-mono">{map.Global}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI RFQ Parser Modal */}
      <RfqParserModal isOpen={isRfqModalOpen} onClose={() => setIsRfqModalOpen(false)} />
    </div>
  );
};
