import type { Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import HostProfileModel from "../models/hostprofile.model";
import cloudinary from "../config/cloudinaryConfig";
import dotenv from "dotenv";
import Booking from "../models/booking.model";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";

dotenv.config();

// Initialize Expo SDK
const expo = new Expo();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload an image to Cloudinary and return the URL
const uploadImage = async (base64Image: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "image",
      transformation: { width: 600, height: 600, crop: "fill" },
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.log("Image upload error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// Helper function to send push notification
export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data: object = {}
) {
  try {
    // Validate the push token - accept both Expo and FCM tokens
    if (
      !Expo.isExpoPushToken(pushToken) &&
      !pushToken.includes("ExponentPushToken") &&
      !pushToken.startsWith("fcm:")
    ) {
      console.error(`Push token ${pushToken} is not a valid token`);
      return { success: false, error: "Invalid push token" };
    }

    // Create the message
    const message: ExpoPushMessage = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
      priority: "high",
    };

    // Send the notification
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log("Push notification sent successfully:", ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
        return { success: false, error };
      }
    }

    // Check for errors
    const receiptIds = [];
    for (const ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
      if (ticket.status === "error") {
        console.error(`Error sending notification: ${ticket.message}`);
        return {
          success: false,
          error: ticket.message,
          details: ticket.details,
        };
      }
    }

    return { success: true, tickets, receiptIds };
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
    return { success: false, error };
  }
}

export const createHostProfile = catchAsyncError(
  async (req: Request, res: Response, next: any) => {
    try {
      // Check if the user already has a host profile
      const existingHostProfile = await HostProfileModel.findOne({
        userId: req.user?.id,
      });

      if (existingHostProfile) {
        return res.status(400).json({
          success: false,
          message: "User already has a host profile",
        });
      }

      // Destructure request body
      const {
        fullName,
        phoneNumber,
        email,
        age,
        gender,
        dateOfBirth,
        profession,
        location,
        line1,
        line2,
        city,
        pincode,
        residenceType,
        builtUpArea,
        petSize,
        petGender,
        petCount,
        willingToWalk,
        hasAreaRestrictions,
        areaRestrictions,
        walkFrequency,
        walkDuration,
        willingToCook,
        cookingOptions,
        groomPet,
        hasPet,
        pets,
        hasVetNearby,
        vetInfo,
        HostProfile: {
          profileImage,
          bio,
          idProof,
          facilityPictures,
          petPictures,
          pricingDaycare,
          pricingBoarding,
          pricingVegMeal,
          pricingNonVegMeal,
        },
        paymentDetails: {
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
          upiid,
        },
      } = req.body;

      // Upload images to Cloudinary
      const uploadedProfileImage = profileImage
        ? await uploadImage(profileImage, "host_profiles/profile_Image")
        : null;

      const uploadedIdProof = idProof
        ? await uploadImage(idProof, "host_profiles/host_idproof")
        : null;

      const uploadedFacilityPictures = await Promise.all(
        facilityPictures.map(async (base64Image: string) => {
          if (base64Image && base64Image.trim() !== "") {
            return await uploadImage(
              base64Image,
              "host_profiles/facility_pictures"
            );
          }
          return null;
        })
      ).then((pictures) => pictures.filter((picture) => picture !== null));

      const uploadedPetPictures = await Promise.all(
        petPictures.map(async (base64Image: string) => {
          if (base64Image && base64Image.trim() !== "") {
            return await uploadImage(base64Image, "host_profiles/pet_pictures");
          }
          return null;
        })
      ).then((pictures) => pictures.filter((picture) => picture !== null));

      // Create the host profile
      const newHostProfile = new HostProfileModel({
        userId: req.user?.id,
        fullName,
        phoneNumber,
        email,
        age,
        gender,
        dateOfBirth,
        profession,
        location,
        line1,
        line2,
        city,
        pincode,
        residenceType,
        builtUpArea,
        petSize,
        petGender,
        petCount,
        willingToWalk,
        hasAreaRestrictions,
        areaRestrictions,
        walkFrequency,
        walkDuration,
        willingToCook,
        cookingOptions,
        groomPet,
        hasPet,
        pets,
        hasVetNearby,
        vetInfo,

        hostProfile: {
          profileImage: uploadedProfileImage?.url || "",
          bio,
          idProof: uploadedIdProof?.url || "",
          facilityPictures: uploadedFacilityPictures.map(
            (pic) => pic?.url || ""
          ),
          petPictures: uploadedPetPictures.map((pic) => pic?.url || ""),
          pricingDaycare,
          pricingBoarding,
          pricingVegMeal,
          pricingNonVegMeal,
        },

        paymentDetails: {
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
          upiid,
        },
      });

      const savedHostProfile = await newHostProfile.save();

      res.status(201).json({
        success: true,
        message: "Host Profile Created Successfully",
        hostProfile: savedHostProfile,
      });
    } catch (error: any) {
      console.log("Host Profile Creation Error:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updatehostpushtoken = async (req: Request, res: Response) => {
  try {
    const { pushToken } = req.body;
    const userId = (req as any).user.id;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    console.log(`Updating push token for host ${userId}: ${pushToken}`);

    // Find and update the host profile
    const hostProfile = await HostProfileModel.findOneAndUpdate(
      { userId },
      { pushToken },
      { new: true }
    );

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found",
      });
    }

    // Send a test notification to verify token works
    try {
      const notificationResult = await sendPushNotification(
        pushToken,
        "Push Notifications Enabled",
        "You will now receive booking notifications!",
        { type: "token_registered" }
      );

      console.log("Test notification result:", notificationResult);
    } catch (error) {
      console.error("Error sending test notification:", error);
      // Continue even if test notification fails
    }

    res.status(200).json({
      success: true,
      message: "Push token updated successfully",
      hostProfile,
    });
  } catch (error) {
    console.error("Error updating push token:", error);
    res.status(500).json({
      success: false,
      message: "Error updating push token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Other controller methods remain the same...
export const getHostBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find bookings where the user is the selected host
    const bookings = await Booking.find({ selectedHost: userId })
      .populate("userId", "name email")
      .populate("pets", "name image")
      .populate("selectedHost", "name email");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this host.",
      });
    }

    // Respond with the found bookings
    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log("Error fetching host bookings:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the bookings.",
    });
  }
};

export const getHost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find bookings where the user is the selected host
    const host = await HostProfileModel.findOne({ userId }).populate("userId");

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "No host found",
      });
    }

    // Respond with the found bookings
    res.status(200).json({
      success: true,
      host,
    });
  } catch (error) {
    console.log("Error fetching host:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the host.",
    });
  }
};

export const deleteHostProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find the host profile by userId
    const hostProfile = await HostProfileModel.findOne({ userId });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found.",
      });
    }

    // Delete the host profile
    await HostProfileModel.deleteOne({ userId });

    // Optionally, clean up associated data, e.g., remove host references in bookings
    await Booking.updateMany(
      { acceptedHosts: hostProfile._id },
      { $pull: { acceptedHosts: hostProfile._id } }
    );

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: "Host profile successfully deleted.",
    });
  } catch (error: any) {
    console.log("Error deleting host profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the host profile.",
      error: error.message,
    });
  }
};
