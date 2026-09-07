export interface ParsedRfqResult {
  productName: string;
  category: string;
  hsCode: string;
  materialGrade: string;
  quantity: number;
  unitOfMeasure: string;
  pressureOrPowerRating: string;
  requiredStandards: string[];
  requiredCertificates: string[];
  destinationPort: string;
  preferredIncoterm: string;
  deliveryDeadlineDays: number;
  extractedNotes: string;
  draftQuoteResponse: {
    subject: string;
    body: string;
    estimatedTotalPriceUSD: number;
    estimatedLeadTimeWeeks: number;
  };
}

export class RfqParserService {
  public parseRfqText(rawText: string): ParsedRfqResult {
    const textLower = rawText.toLowerCase();

    // Default heuristics for extracting specs
    let productName = 'High Pressure Stainless Steel Gate Valve';
    let category = 'Industrial Valves';
    let hsCode = '8481.80.10';
    let materialGrade = 'ASTM A351 CF8M / SS316L';
    let quantity = 250;
    let unitOfMeasure = 'Units';
    let pressureOrPowerRating = 'Class 300 / PN 40';
    let destinationPort = 'Port of Rotterdam';
    let preferredIncoterm = 'CIF';
    let deliveryDeadlineDays = 45;

    // Detect products from raw text
    if (textLower.includes('pump') || textLower.includes('slurry') || textLower.includes('submersible')) {
      productName = 'Heavy Duty Submersible Slurry Pump';
      category = 'Submersible & Slurry Pumps';
      hsCode = '8413.70.20';
      materialGrade = 'High Chrome Alloy (A532) / SS316';
      pressureOrPowerRating = '75 kW / 415V 50Hz';
      quantity = 15;
    } else if (textLower.includes('transformer') || textLower.includes('kva') || textLower.includes('voltage')) {
      productName = 'Three-Phase Oil Immersed Power Transformer';
      category = 'Power Transformers';
      hsCode = '8504.23.00';
      materialGrade = 'CRGO Steel Core / Copper Windings';
      pressureOrPowerRating = '10,000 kVA / 33kV to 11kV';
      quantity = 4;
    } else if (textLower.includes('gear') || textLower.includes('reducer') || textLower.includes('box')) {
      productName = 'Precision Helical Gearbox Reducer';
      category = 'Precision Gears & Reducers';
      hsCode = '8483.40.10';
      materialGrade = '20CrMnTi Alloy Case Hardened';
      pressureOrPowerRating = '50 kW Ratio 1:40';
      quantity = 50;
    } else if (textLower.includes('fitting') || textLower.includes('flange') || textLower.includes('hydraulic')) {
      productName = 'Forged Hydraulic Pipe Flanges & Couplings';
      category = 'Hydraulic Fittings & Flanges';
      hsCode = '7307.91.00';
      materialGrade = 'Duplex Stainless Steel F51';
      pressureOrPowerRating = '6000 PSI High Pressure';
      quantity = 1200;
    }

    // Detect numbers/quantities if explicit
    const qtyMatch = rawText.match(/(?:qty|quantity|pcs|units|number)[:\s=]+(\d+)/i);
    if (qtyMatch && qtyMatch[1]) {
      quantity = parseInt(qtyMatch[1], 10);
    }

    // Detect destination port if explicit
    if (textLower.includes('houston')) destinationPort = 'Port of Houston';
    else if (textLower.includes('hamburg')) destinationPort = 'Port of Hamburg';
    else if (textLower.includes('jebel ali') || textLower.includes('dubai')) destinationPort = 'Jebel Ali Port';
    else if (textLower.includes('singapore')) destinationPort = 'Port of Singapore';

    // Detect incoterms
    if (textLower.includes('fob')) preferredIncoterm = 'FOB';
    else if (textLower.includes('exw')) preferredIncoterm = 'EXW';
    else if (textLower.includes('ddp')) preferredIncoterm = 'DDP';
    else if (textLower.includes('cfr')) preferredIncoterm = 'CFR';

    const requiredStandards = ['ASME B16.34', 'API 6D', 'ISO 9001:2015'];
    const requiredCertificates = ['EN 10204 3.1 Mill Test Certificate', 'Hydrostatic Test Report', 'CE Mark'];

    const estimatedUnitPrice = category === 'Power Transformers' ? 28500 : category === 'Submersible & Slurry Pumps' ? 4200 : 185;
    const estimatedTotalPriceUSD = estimatedUnitPrice * quantity;
    const estimatedLeadTimeWeeks = category === 'Power Transformers' ? 10 : 4;

    const subject = `Technical & Commercial Quotation: ${productName} (RFQ Spec Ref #${Math.floor(100000 + Math.random() * 900000)})`;

    const body = `Dear Procurement & Engineering Team,\n\nThank you for sharing your RFQ specification document. We have reviewed your technical requirements for ${productName} (${materialGrade}, ${pressureOrPowerRating}).\n\nOur ISO 9001 & CE-certified export manufacturing facility is pleased to submit our formal commercial quotation below:\n\n` +
      `📋 TECHNICAL & COMMERCIAL OFFER SUMMARY:\n` +
      `- Product: ${productName}\n` +
      `- HS Code: ${hsCode}\n` +
      `- Material & Spec: ${materialGrade} | ${pressureOrPowerRating}\n` +
      `- Compliance: ${requiredStandards.join(', ')}\n` +
      `- Quantity: ${quantity} ${unitOfMeasure}\n` +
      `- Unit Price (${preferredIncoterm} ${destinationPort}): $${estimatedUnitPrice.toLocaleString()} USD\n` +
      `- Total Net Amount: $${estimatedTotalPriceUSD.toLocaleString()} USD\n` +
      `- Documentation Included: ${requiredCertificates.join('; ')}\n` +
      `- Estimated Delivery Lead Time: ${estimatedLeadTimeWeeks} weeks from L/C issuance / T/T advance deposit.\n\n` +
      `Please find attached our full product catalog, dimensional CAD drawings, and 3.1 Mill Test Report samples.\n\n` +
      `Would you like to schedule a short technical clarification call with our Senior Lead Engineer this week?\n\nSincerely,\nExport Sales Engineering Team`;

    return {
      productName,
      category,
      hsCode,
      materialGrade,
      quantity,
      unitOfMeasure,
      pressureOrPowerRating,
      requiredStandards,
      requiredCertificates,
      destinationPort,
      preferredIncoterm,
      deliveryDeadlineDays,
      extractedNotes: `Extracted from RFQ text (${rawText.slice(0, 100)}...)`,
      draftQuoteResponse: {
        subject,
        body,
        estimatedTotalPriceUSD,
        estimatedLeadTimeWeeks,
      },
    };
  }
}

export const rfqParserService = new RfqParserService();
