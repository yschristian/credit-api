import { Request, Response, NextFunction } from "express";
import { UsersService } from "./users.service";
import { sendSuccess } from "../../utils/response.util";
import { AuthRequest } from "../../middleware/auth.middleware";

export class UsersController {
  private service: UsersService;

  constructor() {
    this.service = new UsersService();
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.createUser(req.body);
      sendSuccess(res, "User created successfully", user, 201);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.service.getUserById(id);
      sendSuccess(res, "User fetched successfully", user);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getAllUsers(page, limit);
      sendSuccess(res, "Users fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.service.updateUser(id, req.body);
      sendSuccess(res, "User updated successfully", user);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteUser(id);
      sendSuccess(res, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const user = await this.service.getUserById(userId);
      sendSuccess(res, "Profile fetched successfully", user);
    } catch (error) {
      next(error);
    }
  };
}