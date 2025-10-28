import { Router } from "express";
import { LoansController } from "./loans.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { ApplyLoanDto, } from "./loans.dto";

const router = Router();
const controller = new LoansController();

/**
 * @swagger
 * /loans/apply:
 *   post:
 *     tags: [Loans]
 *     summary: Apply for a loan
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/apply",
  authenticate,
  validate(ApplyLoanDto),
  controller.applyForLoan
);

/**
 * @swagger
 * /loans/eligibility:
 *   get:
 *     tags: [Loans]
 *     summary: Check loan eligibility
 *     security:
 *       - bearerAuth: []
 */
router.get("/eligibility", authenticate, controller.getLoanEligibility);

/**
 * @swagger
 * /loans/my-loans:
 *   get:
 *     tags: [Loans]
 *     summary: Get user's loans
 *     security:
 *       - bearerAuth: []
 */
router.get("/my-loans", authenticate, controller.getUserLoans);

/**
 * @swagger
 * /loans/stats:
 *   get:
 *     tags: [Loans]
 *     summary: Get user's loan statistics
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", authenticate, controller.getUserLoanStats);

/**
 * @swagger
 * /loans:
 *   get:
 *     tags: [Loans]
 *     summary: Get all loans (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, authorize("ADMIN"), controller.getAllLoans);

/**
 * @swagger
 * /loans/{id}:
 *   get:
 *     tags: [Loans]
 *     summary: Get loan by ID
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, controller.getLoanById);

/**
 * @swagger
 * /loans/{id}/approve:
 *   put:
 *     tags: [Loans]
 *     summary: Approve loan (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id/approve",
  authenticate,
  authorize("ADMIN"),
  controller.approveLoan
);

/**
 * @swagger
 * /loans/{id}/reject:
 *   put:
 *     tags: [Loans]
 *     summary: Reject loan (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id/reject",
  authenticate,
  authorize("ADMIN"),
  controller.rejectLoan
);

export default router;