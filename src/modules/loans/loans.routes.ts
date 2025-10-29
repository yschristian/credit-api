import { Router } from "express";
import { LoansController } from "./loans.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { ApplyLoanDto } from "./loans.dto";

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loanAmount
 *               - duration
 *               - purpose
 *             properties:
 *               loanAmount:
 *                 type: number
 *                 example: 5000
 *               duration:
 *                 type: number
 *                 example: 12
 *               purpose:
 *                 type: string
 *                 example: "Business expansion"
 *     responses:
 *       201:
 *         description: Loan application submitted successfully
 *       400:
 *         description: Invalid input or insufficient balance
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: Loan eligibility status retrieved successfully
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: List of user's loans retrieved successfully
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: Loan statistics retrieved successfully
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: List of all loans retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admins only
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
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Loan ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
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
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Loan ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admins only
 *       404:
 *         description: Loan not found
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
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Loan ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admins only
 *       404:
 *         description: Loan not found
 */
router.put(
  "/:id/reject",
  authenticate,
  authorize("ADMIN"),
  controller.rejectLoan
);

export default router;
