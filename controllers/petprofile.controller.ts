import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { PetProfileModel } from "../models/petprofile.model";
import cloudinary from "../config/cloudinaryConfig";
import dotenv from "dotenv";

// Helper function to convert date string to Date object
const parseDate = (dateString: string) => {
  const parts = dateString.split("/");
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Format to YYYY-MM-DD
};

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CreatePetProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        petType,
        petName,
        petBreed,
        petAgeYears,
        petAgeMonths,
        petGender,
        lastHeatCycle,
        isNeutered,
        neuteredDate,
        pottyTraining,
        toiletBreaks,
        bathingFrequency,
        walkPerDay,
        dailyCombing,
        dietSchedule,
        foodAllergy,
        vaccinationDate,
        dewormingDate,
        tickTreatmentDate,
        medicationDetails,
        aggressiveTendencies,
        resourceGuarding,
        groomingAggression,
        collarAggression,
        foodAggression,
        petImages, // Expecting base64 strings here
      } = req.body;

      // Convert string dates to Date objects
      const formattedNeuteredDate = isNeutered
        ? parseDate(neuteredDate)
        : undefined;
      const formattedLastHeatCycle =
        petGender === "female" ? parseDate(lastHeatCycle) : undefined;

      // Filter out empty strings from petImages and validate base64
      const filteredPetImages = petImages.filter(
        (img: string) => img && img.trim() !== ""
      );

      // Ensure at least one valid image is provided
      if (filteredPetImages.length === 0) {
        return next(
          new ErrorHandler("At least one pet image is required.", 400)
        );
      }

      // Upload images to Cloudinary and gather their URLs
      const uploadedImages = await Promise.all(
        filteredPetImages.map(async (base64Image: string) => {
          try {
            const result = await cloudinary.uploader.upload(base64Image, {
              folder: "pet_profiles", // Folder where pet images will be stored
              resource_type: "image", // Specify resource type
              transformation: { width: 600, height: 600, crop: "fill" }, // Resize image if needed
            });
            return {
              public_id: result.public_id,
              url: result.secure_url,
            };
          } catch (uploadError) {
            console.log("Image upload error:", uploadError);
            throw new Error("Failed to upload image to Cloudinary.");
          }
        })
      );

      // Create a new pet profile with the uploaded images
      const newPetProfile = new PetProfileModel({
        userId: req.user?.id,
        petType,
        petName,
        petBreed,
        petAgeYears,
        petAgeMonths,
        petGender,
        lastHeatCycle: formattedLastHeatCycle,
        isNeutered,
        neuteredDate: formattedNeuteredDate,
        pottyTraining,
        toiletBreaks,
        bathingFrequency,
        walkPerDay,
        dailyCombing,
        dietSchedule,
        foodAllergy,
        vaccinationDate,
        dewormingDate,
        tickTreatmentDate,
        medicationDetails,
        aggressiveTendencies,
        resourceGuarding,
        groomingAggression,
        collarAggression,
        foodAggression,
        petImages: uploadedImages,
      });

      const savedPetProfile = await newPetProfile.save();

      res.status(201).json({
        success: true,
        message: "Profile Created Successfully",
        petProfile: savedPetProfile,
      });
    } catch (error: any) {
      console.log("Validation Error:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const GetPetProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming req.user contains the logged-in user's ID (e.g., set by an auth middleware)
      const userId = req.user?.id;

      // Find pet profiles associated with the logged-in user
      const petProfiles = await PetProfileModel.find({ userId });

      // If no profiles found, return a 404 error
      if (!petProfiles || petProfiles.length === 0) {
        return next(
          new ErrorHandler("No pet profiles found for this user", 404)
        );
      }

      // Send the pet profiles in the response
      res.status(200).json({
        success: true,
        data: petProfiles,
      });
    } catch (error: any) {
      console.log("Validation Error:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
