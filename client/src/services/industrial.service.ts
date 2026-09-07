import api from './api';
import { LandedCostInput, LandedCostResult, HsCodeEntry, ParsedRfqResult } from '../types';

export const industrialService = {
  getHsCodes: async (): Promise<HsCodeEntry[]> => {
    const response = await api.get<{ success: boolean; data: HsCodeEntry[] }>('/industrial/hs-codes');
    return response.data.data;
  },

  getStandardsMatrix: async (): Promise<Record<string, { US: string; EU: string; Global: string }>> => {
    const response = await api.get<{ success: boolean; data: Record<string, { US: string; EU: string; Global: string }> }>(
      '/industrial/standards-matrix'
    );
    return response.data.data;
  },

  calculateQuote: async (input: LandedCostInput): Promise<LandedCostResult> => {
    const response = await api.post<{ success: boolean; calculation: LandedCostResult }>('/industrial/calculate-quote', input);
    return response.data.calculation;
  },

  parseRfq: async (rawText: string): Promise<ParsedRfqResult> => {
    const response = await api.post<{ success: boolean; data: ParsedRfqResult }>('/industrial/parse-rfq', { rawText });
    return response.data.data;
  },
};
