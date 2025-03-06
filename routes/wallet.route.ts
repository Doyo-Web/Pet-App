import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  getWallet,
  getTransactions,
  requestWithdrawal,
  getWithdrawals,
} from "../controllers/wallet.controller";

const router = express.Router();

// Get wallet balance and recent transactions
router.get("/wallet", isAuthenticated, getWallet);

// Get all transactions with pagination
router.get("/wallet/transactions", isAuthenticated, getTransactions);

// Request withdrawal
router.post("/wallet/withdraw", isAuthenticated, requestWithdrawal);

// Get withdrawal history
router.get("/wallet/withdrawals", isAuthenticated, getWithdrawals);

export default router;
