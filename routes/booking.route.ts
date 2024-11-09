import express from "express";
import {
  addAcceptedHost,
  createBooking,
  createRazorpayOrder,
  getBilling,
  getBookings,
  savePaymentDetails,
  updateBookingWithSelectedHost,
} from "../controllers/booking.controller";

import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/booking", isAuthenticated, createBooking);
router.get("/bookings", isAuthenticated, getBookings);
router.put("/accepted-host", isAuthenticated, addAcceptedHost);
router.get("/get-bookings", isAuthenticated, getBookings);
router.post("/confirm-booking", isAuthenticated, updateBookingWithSelectedHost);
router.get("/get-billing", isAuthenticated, getBilling);
router.post("/create-razorpay-order", isAuthenticated, createRazorpayOrder);
router.post("/save-payment", isAuthenticated, savePaymentDetails);

export default router;
