import express from "express";
import { createOrder } from "../controllers/payment.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/create-order", isAuthenticated, createOrder);
// router.post("/verify-payment", isAuthenticated, verifyPayment);

export default router;
