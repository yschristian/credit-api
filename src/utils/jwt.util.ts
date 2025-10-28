import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/env";

export const generateAccessToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any ,
  };

  return jwt.sign(payload, config.jwtSecret as Secret, options);
};

export const generateRefreshToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as any,
  };

  return jwt.sign(payload, config.jwtRefreshSecret as Secret, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret as Secret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwtRefreshSecret as Secret);
};
