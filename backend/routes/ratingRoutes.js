import express from "express";
import {
  submitRating,
  getCounsellorRatings,
  getAllRatings,
  getRatingByRequest,
  getCounsellorsWithRatings
} from "../controllers/ratingController.js";

const router = express.Router();

router.post("/submit", submitRating);
router.get("/counsellor/:counsellorId", getCounsellorRatings);
router.get("/all", getAllRatings);
router.get("/request/:requestId", getRatingByRequest);
router.get("/counsellors-with-ratings", getCounsellorsWithRatings);

export default router;