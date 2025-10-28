import { Router } from "express";
import { SavingsController } from "./savings.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { DepositDto, WithdrawDto } from "./savings.dto";

const router = Router();
const controller = new SavingsController();

/**
 * @swagger
 * /savings/deposit:
 *   post:
 *     tags: [Savings]
 *     summary: Make a deposit
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/deposit",
  authenticate,
  validate(DepositDto),
  controller.deposit
);

/**
 * @swagger
 * /savings/withdraw:
 *   post:
 *     tags: [Savings]
 *     summary: Make a withdrawal
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/withdraw",
  authenticate,
  validate(WithdrawDto),
  controller.withdraw
);

/**
 * @swagger
 * /savings/transactions:
 *   get:
 *     tags: [Savings]
 *     summary: Get user transactions
 *     security:
 *       - bearerAuth: []
 */
router.get("/transactions", authenticate, controller.getTransactions);

/**
 * @swagger
 * /savings/all-transactions:
 *   get:
 *     tags: [Savings]
 *     summary: Get all transactions (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/all-transactions",
  authenticate,
  authorize("ADMIN"),
  controller.getAllTransactions
);

/**
 * @swagger
 * /savings/stats:
 *   get:
 *     tags: [Savings]
 *     summary: Get user savings statistics
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", authenticate, controller.getStats);

export default router;