import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { CreatePetProfile, GetPetProfile } from "../controllers/petprofile.controller";
import { uploadPetImages } from "../middleware/uploadMiddleware";

const petprofileRouter = express.Router();

// Make sure this is correct
petprofileRouter.post(
  "/petprofile-create",
  isAuthenticated,
  CreatePetProfile
);

petprofileRouter.get("/petprofile-get", isAuthenticated, GetPetProfile);

export default petprofileRouter;
