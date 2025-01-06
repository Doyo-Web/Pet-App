import express from "express";
import { createReview, getAllReviewsWithUserDetails } from "../controllers/review.controller";

import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/create-review", isAuthenticated, createReview);
router.get("/getAll-review", isAuthenticated, getAllReviewsWithUserDetails);

export default router;
