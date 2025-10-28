import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(
    payload,
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(config.jwtSecret, token) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
};