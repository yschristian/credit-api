import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { BadRequestException } from "../common/exceptions";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err) => err.message).join(", ");
        next(new BadRequestException(messages));
      } else {
        next(error);
      }
    }
  };
};
