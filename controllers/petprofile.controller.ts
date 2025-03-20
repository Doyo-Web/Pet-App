import type { Request, Response, NextFunction } from "express";
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

export const GetSinglePetProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Find the specific pet profile by ID and ensure it belongs to the logged-in user
      const petProfile = await PetProfileModel.findOne({
        _id: id,
        userId: userId,
      });

      // If no profile found, return a 404 error
      if (!petProfile) {
        return next(
          new ErrorHandler("Pet profile not found or unauthorized access", 404)
        );
      }

      // Send the pet profile in the response
      res.status(200).json({
        success: true,
        data: petProfile,
      });
    } catch (error: any) {
      console.log("Error fetching pet profile:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const UpdatePetProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Find the pet profile to update
      const existingProfile = await PetProfileModel.findOne({
        _id: id,
        userId: userId,
      });

      // If no profile found, return a 404 error
      if (!existingProfile) {
        return next(
          new ErrorHandler("Pet profile not found or unauthorized access", 404)
        );
      }

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
        petImages, // Expecting base64 strings or existing image URLs
      } = req.body;

      // Convert string dates to Date objects
      const formattedNeuteredDate =
        isNeutered && neuteredDate ? parseDate(neuteredDate) : undefined;
      const formattedLastHeatCycle =
        petGender === "Female" && lastHeatCycle
          ? parseDate(lastHeatCycle)
          : undefined;

      // Process images - handle both existing URLs and new base64 images
      const updatedImages = [];

      // Process each image in the array
      for (const image of petImages) {
        // If it's an existing image URL, keep it as is
        if (typeof image === "string" && image.startsWith("http")) {
          // Find the existing image object that matches this URL
          const existingImage = existingProfile.petImages.find(
            (img: any) => img.url === image
          );

          if (existingImage) {
            updatedImages.push(existingImage);
          }
        }
        // If it's a new base64 image, upload it to Cloudinary
        else if (typeof image === "string" && image.startsWith("data:image")) {
          try {
            const result = await cloudinary.uploader.upload(image, {
              folder: "pet_profiles",
              resource_type: "image",
              transformation: { width: 600, height: 600, crop: "fill" },
            });

            updatedImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          } catch (uploadError) {
            console.log("Image upload error:", uploadError);
            throw new Error("Failed to upload image to Cloudinary.");
          }
        }
      }

      // Ensure at least one valid image is provided
      if (updatedImages.length === 0) {
        return next(
          new ErrorHandler("At least one pet image is required.", 400)
        );
      }

      // Update the pet profile
      const updatedProfile = await PetProfileModel.findByIdAndUpdate(
        id,
        {
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
          petImages: updatedImages,
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
        petProfile: updatedProfile,
      });
    } catch (error: any) {
      console.log("Update Error:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface CloudinaryImage {
  public_id: string;
}

// Add this new controller method for deleting a pet profile
export const deletePetProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id;

    // Find the pet profile
    const petProfile = await PetProfileModel.findById(id);

    if (!petProfile) {
      return res.status(404).json({
        success: false,
        message: "Pet profile not found",
      })
    }

    // Check if the pet profile belongs to the authenticated user
    if (petProfile.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this pet profile",
      })
    }


function isCloudinaryImage(image: any): image is CloudinaryImage {
  return image && typeof image === "object" && "public_id" in image;
}

if (petProfile.petImages && petProfile.petImages.length > 0) {
  for (const image of petProfile.petImages) {
    if (isCloudinaryImage(image) && image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }
}

    // Delete the pet profile from the database
    await PetProfileModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Pet profile deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete pet profile error:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the pet profile",
      error: error.message,
    })
  }
}
