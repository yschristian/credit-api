import { Router } from "express";
import { PaymentsController } from "./payments.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { MakePaymentDto } from "./payments.dto";

const router = Router();
const controller = new PaymentsController();

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Make a loan payment
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticate, validate(MakePaymentDto), controller.makePayment);

/**
 * @swagger
 * /payments/my-payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get user's payments
 *     security:
 *       - bearerAuth: []
 */
router.get("/my-payments", authenticate, controller.getUserPayments);

/**
 * @swagger
 * /payments/loan/{loanId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payments for a specific loan
 *     security:
 *       - bearerAuth: []
 */
router.get("/loan/:loanId", authenticate, controller.getLoanPayments);

/**
 * @swagger
 * /payments/all:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", authenticate, authorize("ADMIN"), controller.getAllPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, controller.getPaymentById);

export default router;