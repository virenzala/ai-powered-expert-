export interface LandedCostInput {
  basePricePerUnitUSD: number;
  quantity: number;
  unitWeightKg: number;
  unitVolumeCbm?: number;
  incoterm: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DDP';
  destinationPort: string;
  freightMode?: 'Ocean FCL' | 'Ocean LCL' | 'Air Express';
  insurancePercentage?: number;
}

export interface LandedCostResult {
  quantity: number;
  exwSubtotalUSD: number;
  fobPortHandlingUSD: number;
  fobTotalUSD: number;
  fobUnitPriceUSD: number;
  oceanFreightUSD: number;
  insuranceUSD: number;
  cifTotalUSD: number;
  cifUnitPriceUSD: number;
  estimatedCustomsDutyUSD: number;
  estimatedDdpTotalUSD: number;
  estimatedTransitDays: number;
  containerDetails: {
    recommendedContainer: '20ft FCL' | '40ft FCL' | 'LCL Ocean Freight' | 'Air Cargo';
    containerCount: number;
    totalWeightKg: number;
    totalVolumeCbm: number;
  };
}

export interface HsCodeEntry {
  code: string;
  category: string;
  description: string;
  typicalDutyRatePct: number;
  primaryStandards: string[];
  requiredCertificates: string[];
}

export class IndustrialCalculatorService {
  // Industrial HS Code Directory
  private hsCatalog: HsCodeEntry[] = [
    {
      code: '8481.80.10',
      category: 'Industrial Valves',
      description: 'Taps, cocks, valves for pipes, boiler shells, tanks - Gate, Globe & Check Valves',
      typicalDutyRatePct: 4.5,
      primaryStandards: ['ASME B16.34', 'API 6D', 'DIN EN 10204', 'BS 5163'],
      requiredCertificates: ['ISO 9001:2015', 'CE Mark / PED 2014/68/EU', '3.1 Mill Test Certificate'],
    },
    {
      code: '8413.70.20',
      category: 'Submersible & Slurry Pumps',
      description: 'Centrifugal pumps for liquids - Heavy duty slurry & submersible pumps',
      typicalDutyRatePct: 3.2,
      primaryStandards: ['ISO 5199', 'ANSI/HI 1.1-1.2', 'DIN 24256'],
      requiredCertificates: ['ISO 9001:2015', 'ATEX Explosion Proof Cert', 'Hydrostatic Test Report'],
    },
    {
      code: '8504.23.00',
      category: 'Power Transformers',
      description: 'Liquid dielectric transformers having power handling capacity exceeding 10,000 kVA',
      typicalDutyRatePct: 2.8,
      primaryStandards: ['IEC 60076', 'IEEE C57.12.00', 'ANSI C57'],
      requiredCertificates: ['ISO 14001', 'KEMA Type Test Report', 'Factory Acceptance Test (FAT)'],
    },
    {
      code: '8483.40.10',
      category: 'Precision Gears & Reducers',
      description: 'Gears and gearing, other than toothed wheels, chain sprockets and other transmission elements',
      typicalDutyRatePct: 5.0,
      primaryStandards: ['AGMA 2001', 'ISO 6336', 'DIN 3990'],
      requiredCertificates: ['ISO 9001:2015', 'Ultrasonic Material Flaw Cert', 'Dimension Inspection Report'],
    },
    {
      code: '7307.91.00',
      category: 'Hydraulic Fittings & Flanges',
      description: 'Tube or pipe fittings (for example, couplings, elbows, sleeves), of iron or steel',
      typicalDutyRatePct: 4.0,
      primaryStandards: ['SAE J514', 'ISO 8434-1', 'ASME B16.5'],
      requiredCertificates: ['ISO 9001', 'NACE MR0175 / ISO 15156 Corrosion Cert', 'Raw Material Heat Code Cert'],
    },
  ];

  // Standards Matrix
  private standardsMatrix: Record<string, { US: string; EU: string; Global: string }> = {
    'Industrial Valves': {
      US: 'ASME B16.34 / ANSI B16.10',
      EU: 'DIN EN 12516 / BS EN 593',
      Global: 'ISO 5208 / API 6D',
    },
    'Centrifugal Pumps': {
      US: 'ANSI / HI 1.3',
      EU: 'DIN 24255 / EN 733',
      Global: 'ISO 2858 / ISO 5199',
    },
    'Electrical Transformers': {
      US: 'IEEE C57.12',
      EU: 'EN 60076',
      Global: 'IEC 60076',
    },
    'Hydraulic Components': {
      US: 'SAE J514 / ASME B16.5',
      EU: 'DIN 2353 / EN 10241',
      Global: 'ISO 8434 / ISO 6162',
    },
  };

  public getHsCatalog(): HsCodeEntry[] {
    return this.hsCatalog;
  }

  public getStandardsMatrix(): Record<string, { US: string; EU: string; Global: string }> {
    return this.standardsMatrix;
  }

  public calculateLandedCost(input: LandedCostInput): LandedCostResult {
    const {
      basePricePerUnitUSD,
      quantity,
      unitWeightKg,
      unitVolumeCbm = 0.05,
      destinationPort,
      insurancePercentage = 0.35,
    } = input;

    const totalWeightKg = quantity * unitWeightKg;
    const totalVolumeCbm = quantity * unitVolumeCbm;

    const exwSubtotalUSD = Math.round(basePricePerUnitUSD * quantity * 100) / 100;
    const fobPortHandlingUSD = Math.round((250 + totalWeightKg * 0.04) * 100) / 100;
    const fobTotalUSD = exwSubtotalUSD + fobPortHandlingUSD;
    const fobUnitPriceUSD = Math.round((fobTotalUSD / quantity) * 100) / 100;

    // Container calculation
    let recommendedContainer: '20ft FCL' | '40ft FCL' | 'LCL Ocean Freight' | 'Air Cargo' = 'LCL Ocean Freight';
    let containerCount = 1;
    let oceanFreightUSD = 0;

    if (input.freightMode === 'Air Express') {
      recommendedContainer = 'Air Cargo';
      oceanFreightUSD = Math.round(totalWeightKg * 4.5 * 100) / 100;
    } else if (totalWeightKg > 20000 || totalVolumeCbm > 50) {
      recommendedContainer = '40ft FCL';
      containerCount = Math.max(1, Math.ceil(totalVolumeCbm / 60));
      oceanFreightUSD = containerCount * 3200;
    } else if (totalWeightKg > 4000 || totalVolumeCbm > 12) {
      recommendedContainer = '20ft FCL';
      containerCount = Math.max(1, Math.ceil(totalVolumeCbm / 28));
      oceanFreightUSD = containerCount * 1850;
    } else {
      recommendedContainer = 'LCL Ocean Freight';
      oceanFreightUSD = Math.round(Math.max(350, totalVolumeCbm * 95) * 100) / 100;
    }

    const insuranceUSD = Math.round((fobTotalUSD * (insurancePercentage / 100)) * 100) / 100;
    const cifTotalUSD = Math.round((fobTotalUSD + oceanFreightUSD + insuranceUSD) * 100) / 100;
    const cifUnitPriceUSD = Math.round((cifTotalUSD / quantity) * 100) / 100;

    const estimatedCustomsDutyUSD = Math.round((cifTotalUSD * 0.045) * 100) / 100;
    const estimatedDdpTotalUSD = Math.round((cifTotalUSD + estimatedCustomsDutyUSD + 450) * 100) / 100;

    // Estimated transit days calculation based on destination port region
    const portLower = (destinationPort || '').toLowerCase();
    let estimatedTransitDays = 22;
    if (portLower.includes('rotterdam') || portLower.includes('hamburg') || portLower.includes('antwerp')) {
      estimatedTransitDays = 24;
    } else if (portLower.includes('houston') || portLower.includes('new york') || portLower.includes('los angeles')) {
      estimatedTransitDays = 28;
    } else if (portLower.includes('jebel ali') || portLower.includes('dubai') || portLower.includes('dammam')) {
      estimatedTransitDays = 10;
    } else if (portLower.includes('singapore') || portLower.includes('yokohama')) {
      estimatedTransitDays = 12;
    }

    return {
      quantity,
      exwSubtotalUSD,
      fobPortHandlingUSD,
      fobTotalUSD,
      fobUnitPriceUSD,
      oceanFreightUSD,
      insuranceUSD,
      cifTotalUSD,
      cifUnitPriceUSD,
      estimatedCustomsDutyUSD,
      estimatedDdpTotalUSD,
      estimatedTransitDays,
      containerDetails: {
        recommendedContainer,
        containerCount,
        totalWeightKg,
        totalVolumeCbm: Math.round(totalVolumeCbm * 100) / 100,
      },
    };
  }
}

export const industrialCalculatorService = new IndustrialCalculatorService();
