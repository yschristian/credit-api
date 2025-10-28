import { Router } from "express";
import { UsersController } from "./users.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { CreateUserDto, UpdateUserDto } from "./users.dto";

const router = Router();
const controller = new UsersController();

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, authorize("ADMIN"), controller.getAllUsers);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 */
router.get("/profile", authenticate, controller.getProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, controller.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authenticate,
  validate(UpdateUserDto),
  controller.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, authorize("ADMIN"), controller.deleteUser);

export default router;