import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createHostProfile } from "../controllers/hostprofile.controller";

const hostProfileRouter = express.Router();

// Route to create a new host profile
hostProfileRouter.post(
  "/hostprofile-create",
  isAuthenticated,
  createHostProfile
);

export default hostProfileRouter;
