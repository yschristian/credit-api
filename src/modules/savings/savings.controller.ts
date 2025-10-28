import { Response, NextFunction } from "express";
import { SavingsService } from "./savings.service";
import { sendSuccess } from "../../utils/response.util";
import { AuthRequest } from "../../middleware/auth.middleware";

export class SavingsController {
  private service: SavingsService;

  constructor() {
    this.service = new SavingsService();
  }

  deposit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.service.deposit(userId, req.body);
      sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  };

  withdraw = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.service.withdraw(userId, req.body);
      sendSuccess(res, result.message, result);
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getTransactions(userId, page, limit);
      sendSuccess(res, "Transactions fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getAllTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getAllTransactions(page, limit);
      sendSuccess(res, "All transactions fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const stats = await this.service.getStats(userId);
      sendSuccess(res, "Statistics fetched successfully", stats);
    } catch (error) {
      next(error);
    }
  };
}