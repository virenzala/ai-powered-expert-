export interface AIClassificationResult {
  classification: 'High Priority Buyer' | 'Medium Priority Buyer' | 'Low Priority Buyer' | 'Unqualified';
  buyerType: 'Importer' | 'Distributor' | 'Wholesaler' | 'Manufacturer' | 'Retailer' | 'Unknown';
  score: number;
  confidence: number;
  reason: string;
  recommendedApproach: string;
}

export interface AIPersonalizationResult {
  subject: string;
  body: string;
  suggestedCta: string;
  incotermUsed?: string;
  rolePersonaApplied?: string;
}

export class MockAIService {
  async classifyLead(leadData: any): Promise<AIClassificationResult> {
    let score = 50;
    let buyerType = leadData.buyerType && leadData.buyerType !== 'Unknown' ? leadData.buyerType : 'Importer';

    const companyName = (leadData.companyName || '').toLowerCase();
    const industry = (leadData.industry || '').toLowerCase();
    const desc = (leadData.companyDescription || '').toLowerCase();
    const country = leadData.country || 'International';
    const productInterest = leadData.productInterest || 'Industrial Equipment';

    // Heuristics for scoring
    if (industry.includes('industrial') || industry.includes('machinery') || industry.includes('manufacturing') || industry.includes('engineering') || industry.includes('epc')) {
      score += 25;
    }
    if (desc.includes('import') || desc.includes('distribut') || desc.includes('wholesal') || companyName.includes('trading') || companyName.includes('import') || companyName.includes('supply')) {
      score += 15;
    }
    if (leadData.hsCode) {
      score += 10;
    }
    if (leadData.technicalStandards && leadData.technicalStandards.length > 0) {
      score += 10;
    }
    if (leadData.website && leadData.website.startsWith('http')) {
      score += 5;
    }
    if (leadData.validationStatus === 'Valid') {
      score += 10;
    } else if (leadData.validationStatus === 'Invalid' || leadData.validationStatus === 'Disposable') {
      score -= 35;
    }

    // Clamp score 0 to 100
    score = Math.max(10, Math.min(98, score));

    let classification: 'High Priority Buyer' | 'Medium Priority Buyer' | 'Low Priority Buyer' | 'Unqualified';
    let recommendedApproach = '';

    if (score >= 75) {
      classification = 'High Priority Buyer';
      const incoterm = leadData.preferredIncoterms || 'CIF';
      const port = leadData.targetPort || 'nearest sea port';
      recommendedApproach = `Proactively offer custom OEM technical product catalog, ISO/CE compliance certificates, and direct container export pricing (${incoterm} ${port}) for ${productInterest} in ${country}.`;
    } else if (score >= 50) {
      classification = 'Medium Priority Buyer';
      recommendedApproach = `Send general B2B technical spec sheet and inquiry follow-up to assess procurement volume in ${country}.`;
    } else if (score >= 30) {
      classification = 'Low Priority Buyer';
      recommendedApproach = `Include in secondary monthly newsletter segment for general export updates.`;
    } else {
      classification = 'Unqualified';
      recommendedApproach = `Archive lead due to low industry alignment and data missing.`;
    }

    // Buyer type detection refinement
    if (desc.includes('distribut') || companyName.includes('distribut')) buyerType = 'Distributor';
    else if (desc.includes('wholesal') || companyName.includes('supply')) buyerType = 'Wholesaler';
    else if (desc.includes('manufactur') || companyName.includes('plant')) buyerType = 'Manufacturer';

    const hsContext = leadData.hsCode ? ` (HS Code ${leadData.hsCode})` : '';

    return {
      classification,
      buyerType,
      score,
      confidence: 0.94,
      reason: `${leadData.companyName} is a target buyer in ${leadData.industry} based in ${country}${hsContext}. Strong affinity for ${productInterest} with verified export procurement profile.`,
      recommendedApproach,
    };
  }

  async personalizeEmail(input: {
    lead: any;
    template: any;
    productName: string;
    organizationName?: string;
  }): Promise<AIPersonalizationResult> {
    const { lead, template, productName, organizationName = 'Apex Industrial Exports' } = input;

    // Substitute standard template variables safely
    let subject = template.subject || `Export Supply of ${productName} for {{company_name}}`;
    let body = template.body || `Hello {{contact_name}},\n\nI noticed {{company_name}} operates in {{industry}} in {{country}}...`;

    const incoterm = lead.preferredIncoterms || template.incotermDefault || 'CIF';
    const port = lead.targetPort || 'Rotterdam Port';
    const hsCode = lead.hsCode || template.hsCodeContext || '8481.80';
    const roleCategory = lead.roleCategory || template.targetRoleCategory || 'Procurement';

    const replacements: Record<string, string> = {
      '{{company_name}}': lead.companyName || 'your company',
      '{{contact_name}}': lead.contactName || 'Valued Buyer',
      '{{job_title}}': lead.jobTitle || 'Procurement Manager',
      '{{country}}': lead.country || 'your market',
      '{{industry}}': lead.industry || 'the industrial sector',
      '{{product_name}}': productName || lead.productInterest || 'Industrial Components',
      '{{organization_name}}': organizationName,
      '{{hs_code}}': hsCode,
      '{{incoterm}}': incoterm,
      '{{target_port}}': port,
    };

    for (const [key, val] of Object.entries(replacements)) {
      const reg = new RegExp(key.replace(/[{()}]/g, '\\$&'), 'g');
      subject = subject.replace(reg, val);
      body = body.replace(reg, val);
    }

    // Dynamic Role Persona Copy Injection
    let personaParagraph = '';
    if (roleCategory === 'Engineering') {
      personaParagraph = `Regarding technical compliance: Our ${productName} line is engineered to ASME B16.34 & DIN EN standards with 100% hydrostatic and non-destructive testing (NDT). We provide full CAD step files and material heat-number traceability for your engineering evaluation.`;
    } else if (roleCategory === 'Quality QA/QC') {
      personaParagraph = `Quality Assurance Highlight: Every shipment is dispatched with EN 10204 3.1 Mill Test Certificates, ISO 9001:2015 quality audit records, and CE Mark compliance documentation. Third-party inspection (TÜV, SGS) is fully welcome prior to dispatch.`;
    } else if (roleCategory === 'Procurement') {
      personaParagraph = `Commercial & Logistics Advantage: We offer competitive ${incoterm} ${port} container rates, flexible L/C payment terms, and direct factory container dispatch within 3-4 weeks to support your supply chain targets.`;
    } else {
      personaParagraph = `As an established ISO 9001 certified manufacturer of export-grade ${productName} (HS Code: ${hsCode}), we support international buyers with OEM technical customization and direct ${incoterm} ${port} shipping.`;
    }

    if (!body.includes(personaParagraph)) {
      const bodyLines = body.split('\n\n');
      if (bodyLines.length > 1) {
        bodyLines.splice(1, 0, personaParagraph.trim());
        body = bodyLines.join('\n\n');
      } else {
        body += '\n\n' + personaParagraph.trim();
      }
    }

    let suggestedCta = `Would you be open to a 10-minute technical discovery call next Tuesday to review OEM specifications and sample export terms?`;
    if (roleCategory === 'Engineering') {
      suggestedCta = `Should I send over our 3D CAD step files and material test spec sheets for your engineering team to evaluate?`;
    } else if (roleCategory === 'Procurement') {
      suggestedCta = `Can I share our 2026 FOB/CIF export price list and container lead time schedule for your review?`;
    }

    return {
      subject,
      body,
      suggestedCta,
      incotermUsed: incoterm,
      rolePersonaApplied: roleCategory,
    };
  }
}

