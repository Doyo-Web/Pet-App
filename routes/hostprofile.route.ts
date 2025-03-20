import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  createHostProfile,
  deleteHostProfile,
  getHost,
  getHostBookings,
  getHostDetails,
  updatehostpushtoken,
} from "../controllers/hostprofile.controller";

const hostProfileRouter = express.Router();

// Increase payload limit to 50mb to handle large base64 image uploads
hostProfileRouter.use(express.json({ limit: "200mb" }));
hostProfileRouter.use(express.urlencoded({ limit: "200mb", extended: true }));

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


hostProfileRouter.put(
  "/update-host-push-token",
  isAuthenticated,
  updatehostpushtoken
);

hostProfileRouter.get(
  "/get-host-details/:hostId",
  isAuthenticated,
  getHostDetails
);
export default hostProfileRouter;
