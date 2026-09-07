import React, { useState } from 'react';
import { Calculator, Ship, DollarSign, Package, ShieldCheck, Clock, Copy, Check } from 'lucide-react';
import { industrialService } from '../../services/industrial.service';
import { LandedCostResult } from '../../types';

export const LandedCostCalculator: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number>(180);
  const [quantity, setQuantity] = useState<number>(100);
  const [unitWeight, setUnitWeight] = useState<number>(15);
  const [incoterm, setIncoterm] = useState<'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DDP'>('CIF');
  const [destinationPort, setDestinationPort] = useState<string>('Port of Rotterdam');
  const [freightMode, setFreightMode] = useState<'Ocean FCL' | 'Ocean LCL' | 'Air Express'>('Ocean FCL');
  
  const [calculation, setCalculation] = useState<LandedCostResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const result = await industrialService.calculateQuote({
        basePricePerUnitUSD: basePrice,
        quantity,
        unitWeightKg: unitWeight,
        incoterm,
        destinationPort,
        freightMode,
      });
      setCalculation(result);
    } catch (err) {
      console.error('Failed to calculate landed cost', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleCalculate();
  }, []);

  const copyQuoteToClipboard = () => {
    if (!calculation) return;
    const summary = `📦 EXPORT COMMERCIAL FREIGHT QUOTE (${incoterm} ${destinationPort})
------------------------------------------------
Quantity: ${calculation.quantity} Units
Base Price (EXW): $${calculation.exwSubtotalUSD.toLocaleString()} USD
FOB Port Handling: $${calculation.fobPortHandlingUSD.toLocaleString()} USD
Ocean Freight (${freightMode}): $${calculation.oceanFreightUSD.toLocaleString()} USD
Marine Cargo Insurance: $${calculation.insuranceUSD.toLocaleString()} USD
------------------------------------------------
CIF TOTAL AMOUNT: $${calculation.cifTotalUSD.toLocaleString()} USD ($${calculation.cifUnitPriceUSD}/unit)
Container Logistics: ${calculation.containerDetails.recommendedContainer} (${calculation.containerDetails.totalWeightKg.toLocaleString()} kg total)
Estimated Ocean Transit: ~${calculation.estimatedTransitDays} days to ${destinationPort}`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Incoterms & Landed Cost Shipping Estimator</h3>
            <p className="text-xs text-slate-400">Calculate EXW, FOB, CIF, DDP costs and container load logistics in real time.</p>
          </div>
        </div>

        {calculation && (
          <button
            onClick={copyQuoteToClipboard}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span>{copied ? 'Quote Copied!' : 'Copy Quote Text'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Controls */}
        <form onSubmit={handleCalculate} className="lg:col-span-5 space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Base Price / Unit (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Order Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Unit Weight (kg)</label>
              <input
                type="number"
                value={unitWeight}
                onChange={(e) => setUnitWeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Incoterms</label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="EXW">EXW (Ex Works)</option>
                <option value="FOB">FOB (Free On Board)</option>
                <option value="CFR">CFR (Cost & Freight)</option>
                <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                <option value="DDP">DDP (Delivered Duty Paid)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Destination Port</label>
              <input
                type="text"
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                placeholder="e.g. Port of Rotterdam"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Freight Mode</label>
              <select
                value={freightMode}
                onChange={(e) => setFreightMode(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Ocean FCL">Ocean FCL (Full Container)</option>
                <option value="Ocean LCL">Ocean LCL (Shared Cargo)</option>
                <option value="Air Express">Air Cargo Express</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Recalculate Landed Quote'}
          </button>
        </form>

        {/* Calculation Output Cards */}
        <div className="lg:col-span-7 space-y-4">
          {calculation ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                    <span>FOB Port Price</span>
                  </div>
                  <div className="text-lg font-bold text-white">${calculation.fobTotalUSD.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">${calculation.fobUnitPriceUSD}/unit</div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-blue-900/50 bg-blue-950/10">
                  <div className="text-xs text-blue-400 mb-1 flex items-center space-x-1 font-semibold">
                    <Ship className="w-3.5 h-3.5" />
                    <span>CIF Delivered Total</span>
                  </div>
                  <div className="text-xl font-extrabold text-blue-400">${calculation.cifTotalUSD.toLocaleString()}</div>
                  <div className="text-[10px] text-blue-300">${calculation.cifUnitPriceUSD}/unit</div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Estimated DDP</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">${calculation.estimatedDdpTotalUSD.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">Incl. customs & duty</div>
                </div>
              </div>

              {/* Logistics & Container Details */}
              <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Container Payload & Transit Breakdown</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Logistics Mode</div>
                    <div className="font-semibold text-amber-400 mt-0.5">{calculation.containerDetails.recommendedContainer}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Total Cargo Weight</div>
                    <div className="font-semibold text-white mt-0.5">{calculation.containerDetails.totalWeightKg.toLocaleString()} kg</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Ocean Freight</div>
                    <div className="font-semibold text-white mt-0.5">${calculation.oceanFreightUSD.toLocaleString()} USD</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Transit Duration</div>
                    <div className="font-semibold text-emerald-400 mt-0.5 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>~{calculation.estimatedTransitDays} Days</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              Fill parameters and click calculate to view quote breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
