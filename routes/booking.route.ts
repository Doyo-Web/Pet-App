import express from "express";
import { addAcceptedHost, createBooking, getBookings } from "../controllers/booking.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/booking", isAuthenticated, createBooking);
router.get("/bookings", isAuthenticated, getBookings);
router.put("/accepted-host", isAuthenticated, addAcceptedHost);
router.get("/get-bookings", isAuthenticated, getBookings);

export default router;
