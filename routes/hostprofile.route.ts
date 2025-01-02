import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  createHostProfile,
  deleteHostProfile,
  getHost,
  getHostBookings,
} from "../controllers/hostprofile.controller";

const hostProfileRouter = express.Router();

// Route to create a new host profile
hostProfileRouter.post(
  "/hostprofile-create",
  isAuthenticated,
  createHostProfile
);

// Route to get a new host booking
hostProfileRouter.get(
  "/hostbooking",
  isAuthenticated,
  getHostBookings
);

// Route to get a new host booking
hostProfileRouter.get(
  "/host",
  isAuthenticated,
  getHost
);

// Route to delete a host profile
hostProfileRouter.delete("/hostprofile-delete", isAuthenticated, deleteHostProfile);

export default hostProfileRouter;
