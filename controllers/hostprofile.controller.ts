import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import HostProfileModel from "../models/hostprofile.model";
import cloudinary from "../config/cloudinaryConfig";
import dotenv from "dotenv";
import Booking, { IBooking } from "../models/booking.model";

dotenv.config();

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

// export const createHostProfile = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const {
//         fullName,
//         phoneNumber,
//         email,
//         age,
//         gender,
//         dateOfBirth,
//         profession,
//         location,
//         line1,
//         line2,
//         city,
//         pincode,
//         residenceType,
//         builtUpArea,
//         petSize,
//         petGender,
//         petCount,
//         willingToWalk,
//         hasAreaRestrictions,
//         areaRestrictions,
//         walkFrequency,
//         walkDuration,
//         willingToCook,
//         cookingOptions,
//         groomPet,
//         hasPet,
//         pets,
//         hasVetNearby,
//         vetInfo,
//         HostProfile: {
//           profileImage,
//           bio,
//           idProof,
//           facilityPictures,
//           petPictures,
//           pricingDaycare,
//           pricingBoarding,
//           pricingVegMeal,
//           pricingNonVegMeal,
//         },
//         paymentDetails: {
//           accountHolderName,
//           accountNumber,
//           ifscCode,
//           bankName,
//           upiid,
//         },
//       } = req.body;

//       // Upload images to Cloudinary if they are provided as base64
//       const uploadedProfileImage = profileImage
//         ? await uploadImage(profileImage, "host_profiles/profile_Image")
//         : null;

//       const uploadedIdProof = idProof
//         ? await uploadImage(idProof, "host_profiles/host_idproof")
//         : null;

//       const uploadedFacilityPictures = await Promise.all(
//         facilityPictures.map(async (base64Image: string) => {
//           if (base64Image && base64Image.trim() !== "") {
//             return await uploadImage(
//               base64Image,
//               "host_profiles/facility_pictures"
//             );
//           }
//           return null;
//         })
//       ).then((pictures) => pictures.filter((picture) => picture !== null));

//       const uploadedPetPictures = await Promise.all(
//         petPictures.map(async (base64Image: string) => {
//           if (base64Image && base64Image.trim() !== "") {
//             return await uploadImage(base64Image, "host_profiles/pet_pictures");
//           }
//           return null;
//         })
//       ).then((pictures) => pictures.filter((picture) => picture !== null));

//       // Create the host profile with the uploaded image URLs
//       const newHostProfile = new HostProfileModel({
//         userId: req.user?.id,
//         fullName,
//         phoneNumber,
//         email,
//         age,
//         gender,
//         dateOfBirth,
//         profession,
//         location,
//         line1,
//         line2,
//         city,
//         pincode,
//         residenceType,
//         builtUpArea,
//         petSize,
//         petGender,
//         petCount,
//         willingToWalk,
//         hasAreaRestrictions,
//         areaRestrictions,
//         walkFrequency,
//         walkDuration,
//         willingToCook,
//         cookingOptions,
//         groomPet,
//         hasPet,
//         pets,
//         hasVetNearby,
//         vetInfo,

//         hostProfile: {
//           profileImage: uploadedProfileImage?.url || "",
//           bio,
//           idProof: uploadedIdProof?.url || "",
//           facilityPictures: uploadedFacilityPictures.map(
//             (pic) => pic?.url || ""
//           ),
//           petPictures: uploadedPetPictures.map((pic) => pic?.url || ""),
//           pricingDaycare,
//           pricingBoarding,
//           pricingVegMeal,
//           pricingNonVegMeal,
//         },

//         paymentDetails: {
//           accountHolderName,
//           accountNumber,
//           ifscCode,
//           bankName,
//           upiid,
//         },
//       });

//       const savedHostProfile = await newHostProfile.save();

//       res.status(201).json({
//         success: true,
//         message: "Host Profile Created Successfully",
//         hostProfile: savedHostProfile,
//       });
//     } catch (error: any) {
//       console.log("Host Profile Creation Error:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// export const createHostProfile = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Check if the user already has a host profile
//       const existingHostProfile = await HostProfileModel.findOne({
//         userId: req.user?.id,
//       });

//       if (existingHostProfile) {
//         return res.status(400).json({
//           success: false,
//           message: "User already has a host profile",
//         });
//       }

//       // Destructure request body
//       const {
//         fullName,
//         phoneNumber,
//         email,
//         age,
//         gender,
//         dateOfBirth,
//         profession,
//         location,
//         line1,
//         line2,
//         city,
//         pincode,
//         residenceType,
//         builtUpArea,
//         petSize,
//         petGender,
//         petCount,
//         willingToWalk,
//         hasAreaRestrictions,
//         areaRestrictions,
//         walkFrequency,
//         walkDuration,
//         willingToCook,
//         cookingOptions,
//         groomPet,
//         hasPet,
//         pets,
//         hasVetNearby,
//         vetInfo,
//         HostProfile: {
//           profileImage,
//           bio,
//           idProof,
//           facilityPictures,
//           petPictures,
//           pricingDaycare,
//           pricingBoarding,
//           pricingVegMeal,
//           pricingNonVegMeal,
//         },
//         paymentDetails: {
//           accountHolderName,
//           accountNumber,
//           ifscCode,
//           bankName,
//           upiid,
//         },
//       } = req.body;

//       // Upload images to Cloudinary
//       const uploadedProfileImage = profileImage
//         ? await uploadImage(profileImage, "host_profiles/profile_Image")
//         : null;

//       const uploadedIdProof = idProof
//         ? await uploadImage(idProof, "host_profiles/host_idproof")
//         : null;

//       const uploadedFacilityPictures = await Promise.all(
//         facilityPictures.map(async (base64Image: string) => {
//           if (base64Image && base64Image.trim() !== "") {
//             return await uploadImage(
//               base64Image,
//               "host_profiles/facility_pictures"
//             );
//           }
//           return null;
//         })
//       ).then((pictures) => pictures.filter((picture) => picture !== null));

//       const uploadedPetPictures = await Promise.all(
//         petPictures.map(async (base64Image: string) => {
//           if (base64Image && base64Image.trim() !== "") {
//             return await uploadImage(base64Image, "host_profiles/pet_pictures");
//           }
//           return null;
//         })
//       ).then((pictures) => pictures.filter((picture) => picture !== null));

//       // Create the host profile
//       const newHostProfile = new HostProfileModel({
//         userId: req.user?.id,
//         fullName,
//         phoneNumber,
//         email,
//         age,
//         gender,
//         dateOfBirth,
//         profession,
//         location,
//         line1,
//         line2,
//         city,
//         pincode,
//         residenceType,
//         builtUpArea,
//         petSize,
//         petGender,
//         petCount,
//         willingToWalk,
//         hasAreaRestrictions,
//         areaRestrictions,
//         walkFrequency,
//         walkDuration,
//         willingToCook,
//         cookingOptions,
//         groomPet,
//         hasPet,
//         pets,
//         hasVetNearby,
//         vetInfo,

//         hostProfile: {
//           profileImage: uploadedProfileImage?.url || "",
//           bio,
//           idProof: uploadedIdProof?.url || "",
//           facilityPictures: uploadedFacilityPictures.map(
//             (pic) => pic?.url || ""
//           ),
//           petPictures: uploadedPetPictures.map((pic) => pic?.url || ""),
//           pricingDaycare,
//           pricingBoarding,
//           pricingVegMeal,
//           pricingNonVegMeal,
//         },

//         paymentDetails: {
//           accountHolderName,
//           accountNumber,
//           ifscCode,
//           bankName,
//           upiid,
//         },
//       });

//       const savedHostProfile = await newHostProfile.save();

//       res.status(201).json({
//         success: true,
//         message: "Host Profile Created Successfully",
//         hostProfile: savedHostProfile,
//       });
//     } catch (error: any) {
//       console.log("Host Profile Creation Error:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

export const createHostProfile = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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
      pets, // This now includes petType field and temperament with humans instead of human
      hasVetNearby,
      vetInfo,

      hostProfile: {
        profileImage: uploadedProfileImage?.url || "",
        bio,
        idProof: uploadedIdProof?.url || "",
        facilityPictures: uploadedFacilityPictures.map((pic) => pic?.url || ""),
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
});

export const getHostBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming userId is in the request user object via isAuthenticated middleware

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find bookings where the user is the selected host
    const bookings = await Booking.find({ selectedHost: userId })
      .populate("userId", "name email") // Populating user information
      .populate("pets", "name image") // Populating pet details
      .populate("selectedHost", "name email"); // Populating host details;

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
    // Debugging: Log the error
    console.log("Error fetching host bookings:", error);

    // Respond with an error
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the bookings.",
    });
  }
};

export const getHost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming userId is in the request user object via isAuthenticated middleware

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
    // Debugging: Log the error
    console.log("Error fetching host:", error);

    // Respond with an error
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the host.",
    });
  }
};

export const deleteHostProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming `isAuthenticated` middleware attaches `user` to the request object

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
      error: error.message, // Optional: include error details for debugging
    });
  }
};


export const updatehostpushtoken = async (req: Request, res: Response) => {
  try {
    const { pushToken } = req.body;
    const userId = (req as any).user.id;

    

    const hostProfile = await HostProfileModel.findOneAndUpdate(
      { userId },
      { pushToken },
      { new: true }
    );

    if (!hostProfile) {
      return res.status(400).json({
        success: false,
        message: "Host profile not found",
      });
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
    });
  }
};

// Get host details by ID
export const getHostDetails = async (req: Request, res: Response) => {
  try {
    const { hostId } = req.params;


    // Find host by ID
    const host = await HostProfileModel.findOne({userId: hostId}); // Exclude version key

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found'
      });
    }

    const rating = 0;
    
    // Return host details
    return res.status(200).json({
      success: true,
      host: {
        userId: host._id,
        fullName: host.fullName,
        city: host.city || host.line1, // Using line1 as fallback if city is empty
        profileImage: host.hostProfile.profileImage,
        rating: rating,
        bio: host.hostProfile.bio || "No bio provided",
        phoneNumber: host.phoneNumber,
        email: host.email,
        // Additional details you might want to expose
        pricingBoarding: host.hostProfile.pricingBoarding,
        facilityPictures: host.hostProfile.facilityPictures,
      },
    });

  } catch (error) {
    console.error('Error fetching host details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching host details'
    });
  }
};
