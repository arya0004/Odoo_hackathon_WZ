import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getUserById,
  deleteUser,
  createUser,
  updateUser,
} from "../Controller/admin.controller.js";
import { userAuth } from "../middleware/user.middleware.js"; // verifies JWT
import { adminOnly } from "../middleware/admin.middleware.js"; // checks Admin role



const router = express.Router();

// Protect all admin routes
router.use(userAuth, adminOnly);

// Dashboard summary
router.get("/stats", getAdminStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);

router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;