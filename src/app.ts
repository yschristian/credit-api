import express, { Express, Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { setupSwagger } from "./config/swagger";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import savingsRoutes from "./modules/savings/savings.routes";
import loansRoutes from "./modules/loans/loans.routes";
import paymentsRoutes from "./modules/payments/payments.routes";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
setupSwagger(app);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Credit Jambo API is running!",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/loans", loansRoutes);
app.use("/api/payments", paymentsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;