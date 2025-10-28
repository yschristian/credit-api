import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { sendSuccess } from "../../utils/response.util";

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body);
      sendSuccess(res, "Registration successful", result, 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(req.body);
      sendSuccess(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.service.refreshToken(refreshToken);
      sendSuccess(res, "Token refreshed successfully", result);
    } catch (error) {
      next(error);
    }
  };
}