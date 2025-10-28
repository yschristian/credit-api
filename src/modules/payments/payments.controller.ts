import { Response, NextFunction } from "express";
import { PaymentsService } from "./payments.service";
import { sendSuccess } from "../../utils/response.util";
import { AuthRequest } from "../../middleware/auth.middleware";

export class PaymentsController {
  private service: PaymentsService;

  constructor() {
    this.service = new PaymentsService();
  }

  makePayment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const result = await this.service.makePayment(userId, req.body);
      sendSuccess(res, result.message, result.payment, 201);
    } catch (error) {
      next(error);
    }
  };

  getPaymentById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const payment = await this.service.getPaymentById(id);
      sendSuccess(res, "Payment fetched successfully", payment);
    } catch (error) {
      next(error);
    }
  };

  getUserPayments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getUserPayments(userId, page, limit);
      sendSuccess(res, "Payments fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getLoanPayments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { loanId } = req.params;
      const payments = await this.service.getLoanPayments(loanId);
      sendSuccess(res, "Loan payments fetched successfully", payments);
    } catch (error) {
      next(error);
    }
  };

  getAllPayments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getAllPayments(page, limit);
      sendSuccess(res, "All payments fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };
}