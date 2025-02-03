import express from "express";
import {
  addAcceptedHost,
  createBooking,
  createRazorpayOrder,
  declineHost,
  getBilling,
  getBookingById,
  getBookingEndDate,
  getBookings,
  getRequestBooking,
  getUserRelatedBookings,
  savePaymentDetails,
  updateBookingWithSelectedHost,
} from "../controllers/booking.controller";

import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/booking", isAuthenticated, createBooking);
router.get("/bookings", isAuthenticated, getBookings);
router.put("/accepted-host", isAuthenticated, addAcceptedHost);
router.post("/decline-host", isAuthenticated, declineHost);
router.post("/get-booking-by-id", isAuthenticated, getBookingById);
router.post("/confirm-booking", isAuthenticated, updateBookingWithSelectedHost);
router.post("/get-billing", isAuthenticated, getBilling);
router.post("/create-razorpay-order", isAuthenticated, createRazorpayOrder);
router.post("/save-payment", isAuthenticated, savePaymentDetails);
router.get("/getrequestbooking", isAuthenticated, getRequestBooking);
router.get("/user-related-bookings", isAuthenticated, getUserRelatedBookings);
router.post("/booking-enddate", isAuthenticated, getBookingEndDate);

export default router;
