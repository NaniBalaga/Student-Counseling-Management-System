import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
  getAllUsers,
  deleteUser // ✅ Imported
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser); // ✅ Admin Route

export default router;