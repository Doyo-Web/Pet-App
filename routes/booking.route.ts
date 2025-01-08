import express from "express";
import {
  addAcceptedHost,
  createBooking,
  createRazorpayOrder,
  getBilling,
  getBookingById,
  getBookings,
  getRequestBooking,
  savePaymentDetails,
  updateBookingWithSelectedHost,
} from "../controllers/booking.controller";

import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/booking", isAuthenticated, createBooking);
router.get("/bookings", isAuthenticated, getBookings);
router.put("/accepted-host", isAuthenticated, addAcceptedHost);
router.post("/get-booking-by-id", isAuthenticated, getBookingById);
router.post("/confirm-booking", isAuthenticated, updateBookingWithSelectedHost);
router.get("/get-billing", isAuthenticated, getBilling);
router.post("/create-razorpay-order", isAuthenticated, createRazorpayOrder);
router.post("/save-payment", isAuthenticated, savePaymentDetails);
router.get("/getrequestbooking", isAuthenticated, getRequestBooking);
export default router;
