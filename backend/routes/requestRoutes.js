import express from "express";
import {
  createRequest,
  getRequests,
  updateRequestStatus,
  replyToRequest,
  getCounsellors,
  deleteRequest // ✅ Imported
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/create", createRequest);
router.get("/user/:userId/:role", getRequests);
router.put("/status/:id", updateRequestStatus);
router.put("/reply/:id", replyToRequest);
router.get("/counsellors", getCounsellors);
router.delete("/:id", deleteRequest); // ✅ Admin Route

export default router;