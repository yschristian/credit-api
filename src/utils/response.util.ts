import { Response } from "express";
import { ApiResponse } from "../common/interfaces/response.interface";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: message,
  };
  return res.status(statusCode).json(response);
};