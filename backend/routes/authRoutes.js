import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
  getAllUsers,
  deleteUser,
  banUser,
  unbanUser,
  updateWorkingHours,
  checkBanStatus
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/ban/:id", banUser);
router.put("/users/unban/:id", unbanUser);
router.put("/users/working-hours/:id", updateWorkingHours);
router.get("/users/check-ban/:id", checkBanStatus);

export default router;