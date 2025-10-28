import { Response, NextFunction } from "express";
import { LoansService } from "./loans.service";
import { sendSuccess } from "../../utils/response.util";
import { AuthRequest } from "../../middleware/auth.middleware";

export class LoansController {
  private service: LoansService;

  constructor() {
    this.service = new LoansService();
  }

  applyForLoan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const loan = await this.service.applyForLoan(userId, req.body);
      sendSuccess(res, "Loan application submitted successfully", loan, 201);
    } catch (error) {
      next(error);
    }
  };

  approveLoan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const loan = await this.service.approveLoan(id, req.body);
      sendSuccess(res, "Loan approved successfully", loan);
    } catch (error) {
      next(error);
    }
  };

  rejectLoan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const loan = await this.service.rejectLoan(id, req.body);
      sendSuccess(res, "Loan rejected", loan);
    } catch (error) {
      next(error);
    }
  };

  getLoanById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const loan = await this.service.getLoanById(id);
      sendSuccess(res, "Loan fetched successfully", loan);
    } catch (error) {
      next(error);
    }
  };

  getUserLoans = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getUserLoans(userId, page, limit);
      sendSuccess(res, "Loans fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getAllLoans = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this.service.getAllLoans(page, limit, status);
      sendSuccess(res, "All loans fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getLoanEligibility = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const eligibility = await this.service.getLoanEligibility(userId);
      sendSuccess(res, "Eligibility checked successfully", eligibility);
    } catch (error) {
      next(error);
    }
  };

  getUserLoanStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const stats = await this.service.getUserLoanStats(userId);
      sendSuccess(res, "Loan statistics fetched successfully", stats);
    } catch (error) {
      next(error);
    }
  };
}