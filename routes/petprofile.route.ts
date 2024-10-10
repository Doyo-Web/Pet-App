import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { CreatePetProfile } from "../controllers/petprofile.controller";
import { uploadPetImages } from "../middleware/uploadMiddleware";

const petprofileRouter = express.Router();

// Make sure this is correct
petprofileRouter.post(
  "/petprofile-create",
  isAuthenticated,
  CreatePetProfile
);

export default petprofileRouter;
