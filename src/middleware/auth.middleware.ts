import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../common/exceptions";
import { verifyAccessToken } from "../utils/jwt.util";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.substring(7);
    const decoded:any = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedException("Invalid or expired token"));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException("User not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new UnauthorizedException("You don't have permission to access this resource")
      );
    }

    next();
  };
};