import { Request, Response, NextFunction } from 'express';
import { industrialCalculatorService } from '../services/industrialCalculator.service';
import { rfqParserService } from '../services/rfqParser.service';
import { logger } from '../utils/logger';

export class IndustrialController {
  // GET /api/industrial/hs-codes
  public getHsCodes(req: Request, res: Response, next: NextFunction): void {
    try {
      const catalog = industrialCalculatorService.getHsCatalog();
      res.json({
        success: true,
        count: catalog.length,
        data: catalog,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/industrial/standards-matrix
  public getStandardsMatrix(req: Request, res: Response, next: NextFunction): void {
    try {
      const matrix = industrialCalculatorService.getStandardsMatrix();
      res.json({
        success: true,
        data: matrix,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/industrial/calculate-quote
  public calculateQuote(req: Request, res: Response, next: NextFunction): void {
    try {
      const {
        basePricePerUnitUSD,
        quantity,
        unitWeightKg,
        unitVolumeCbm,
        incoterm = 'CIF',
        destinationPort = 'Port of Rotterdam',
        freightMode = 'Ocean FCL',
        insurancePercentage = 0.35,
      } = req.body;

      if (!basePricePerUnitUSD || !quantity || !unitWeightKg) {
        res.status(400).json({
          error: 'Missing required calculation parameters: basePricePerUnitUSD, quantity, unitWeightKg',
        });
        return;
      }

      const result = industrialCalculatorService.calculateLandedCost({
        basePricePerUnitUSD: Number(basePricePerUnitUSD),
        quantity: Number(quantity),
        unitWeightKg: Number(unitWeightKg),
        unitVolumeCbm: unitVolumeCbm ? Number(unitVolumeCbm) : undefined,
        incoterm,
        destinationPort,
        freightMode,
        insurancePercentage: Number(insurancePercentage),
      });

      res.json({
        success: true,
        calculation: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/industrial/parse-rfq
  public parseRfq(req: Request, res: Response, next: NextFunction): void {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
        res.status(400).json({ error: 'rawText string parameter is required' });
        return;
      }

      logger.info(`Parsing RFQ spec document text (${rawText.length} characters)...`);
      const parsedResult = rfqParserService.parseRfqText(rawText);

      res.json({
        success: true,
        data: parsedResult,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const industrialController = new IndustrialController();
