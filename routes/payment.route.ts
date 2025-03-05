import express from "express";
import {
  createOrder,
  getPaymentStatus,
  handleWebhook,
} from "../controllers/payment.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Create a new payment order
router.post("/create-order", isAuthenticated, createOrder);

// Get payment status
router.get("/status/:orderId", isAuthenticated, getPaymentStatus);

// Webhook endpoint for Cashfree notifications
router.post("/webhook", handleWebhook);

export default router;
