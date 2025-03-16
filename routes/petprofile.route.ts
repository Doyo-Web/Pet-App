import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  CreatePetProfile,
  GetPetProfile,
  GetSinglePetProfile,
  UpdatePetProfile,
} from "../controllers/petprofile.controller";

const petprofileRouter = express.Router();

// Create a new pet profile
petprofileRouter.post("/petprofile-create", isAuthenticated, CreatePetProfile);

// Get all pet profiles for the logged-in user
petprofileRouter.get("/petprofile-get", isAuthenticated, GetPetProfile);

// Get a single pet profile by ID
petprofileRouter.get(
  "/petprofile-get/:id",
  isAuthenticated,
  GetSinglePetProfile
);

// Update a pet profile by ID
petprofileRouter.post(
  "/petprofile-update/:id",
  isAuthenticated,
  UpdatePetProfile
);

export default petprofileRouter;
