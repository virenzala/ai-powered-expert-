import React, { useState } from 'react';
import { FileText, Sparkles, X, Check, Copy, ArrowRight } from 'lucide-react';
import { industrialService } from '../../services/industrial.service';
import { ParsedRfqResult } from '../../types';

interface RfqParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuote?: (quote: ParsedRfqResult) => void;
}

export const RfqParserModal: React.FC<RfqParserModalProps> = ({ isOpen, onClose, onApplyQuote }) => {
  const [rawText, setRawText] = useState<string>(
    'Requirement: 250 units of High Pressure Gate Valves (Class 300) in ASTM A351 CF8M (SS316L). Need CIF Port of Rotterdam quotation with 45-day lead time. Must include EN 10204 3.1 Mill Test Certificates.'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedRfqResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const data = await industrialService.parseRfq(rawText);
      setParsedData(data);
    } catch (err) {
      console.error('Failed to parse RFQ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBody = () => {
    if (!parsedData) return;
    navigator.clipboard.writeText(parsedData.draftQuoteResponse.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI RFQ & Tender Reader</h3>
              <p className="text-xs text-slate-400">Extract technical specs from buyer RFQ documents and auto-generate draft proposals.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Input text */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Paste Raw Buyer RFQ Text / Inquiry Specifications:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste email text, RFQ specifications, or tender document contents..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={handleParse}
                disabled={loading || !rawText.trim()}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Analyzing Specs...' : 'Parse RFQ & Draft Offer'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Parsed Result Output */}
          {parsedData && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Product / Category</div>
                  <div className="text-xs font-bold text-indigo-400 mt-1 truncate">{parsedData.productName}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">HS Code & Spec</div>
                  <div className="text-xs font-bold text-white mt-1">HS {parsedData.hsCode}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Incoterm & Port</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">{parsedData.preferredIncoterm} {parsedData.destinationPort}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Estimated Total Quote</div>
                  <div className="text-xs font-bold text-amber-400 mt-1">${parsedData.draftQuoteResponse.estimatedTotalPriceUSD.toLocaleString()} USD</div>
                </div>
              </div>

              {/* Generated Draft Offer Preview */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Generated Commercial & Technical Reply Proposal</span>
                  </span>
                  <button
                    onClick={handleCopyBody}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-md text-slate-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Response'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 font-semibold">
                  Subject: <span className="text-white">{parsedData.draftQuoteResponse.subject}</span>
                </div>

                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 leading-relaxed max-h-60 overflow-y-auto">
                  {parsedData.draftQuoteResponse.body}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg transition">
            Close
          </button>
          {parsedData && onApplyQuote && (
            <button
              onClick={() => {
                onApplyQuote(parsedData);
                onClose();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg shadow-lg shadow-emerald-600/20 transition"
            >
              <span>Use in Outreach Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
