import { NextFunction, Request, Response } from "express";
import Booking, { IBooking } from "../models/booking.model";
import HostProfile from "../models/hostprofile.model";
import mongoose, { Types } from "mongoose";
import Razorpay from "razorpay";
import User from "../models/user.model";
import userModel from "../models/user.model";
import HostProfileModel, {
  IHostProfileModel,
} from "../models/hostprofile.model";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

// Interface for Push Token (assuming hosts have a push token field)
interface IHostWithPushToken extends IHostProfileModel {
  pushToken?: string; // Add pushToken to host profile
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_47UXyR0Uds1kIX",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "wtwcvmmNhfkx66xVD1PFBGkh",
});

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    console.log("Received amount:", amount);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created successfully:", order);

    res.json(order);
  } catch (error: any) {
    console.log("Error creating Razorpay order:", error);
    res.status(500).json({
      error: "Failed to create Razorpay order",
      details: error.message,
    });
  }
};

export const savePaymentDetails = async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentId, orderId, signature, amount } = req.body;
    const userId = (req as any).user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.paymentStatus = "completed";
    booking.paymentDetails = { paymentId, orderId, signature, amount };
    await booking.save();

    res.json({ success: true, message: "Payment details saved successfully" });
  } catch (error) {
    console.log("Error saving payment details:", error);
    res.status(500).json({ error: "Failed to save payment details" });
  }
};

// Controller to create a new booking
// export const createBooking = async (req: Request, res: Response) => {
//   try {
//     const { pets, startDate, startTime, endDate, endTime, city, location, diet } =
//       req.body;
//     const userId = (req as any).user.id; // Extract the logged-in user's ID

//     // Create start and end date times from the provided date and time
//     const startDateTime = new Date(startDate);
//     startDateTime.setHours(
//       new Date(startTime).getHours(),
//       new Date(startTime).getMinutes()
//     );
//     const endDateTime = new Date(endDate);
//     endDateTime.setHours(
//       new Date(endTime).getHours(),
//       new Date(endTime).getMinutes()
//     );

//     // Ensure pets have the correct structure for storing
//     const formattedPets = pets.map((pet: any) => ({
//       id: pet.id,
//       name: pet.name,
//       image: pet.image,
//     }));

//     // Create a new booking instance
//     const newBooking: IBooking = new Booking({
//       userId,
//       pets: formattedPets,
//       startDateTime,
//       endDateTime,
//       city,
//       location: {
//         type: location.type,
//         address: location.address,
//       },
//       diet,
//       acceptedHosts: [], // Initialize with an empty array, to be populated later
//     });

//     // Save the new booking to the database
//     await newBooking.save();

//     res.status(201).json({
//       success: true,
//       message: "Booking created successfully",
//       booking: newBooking,
//     });
//   } catch (error) {
//     console.log("Error creating booking:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating booking",
//       error: (error as Error).message,
//     });
//   }
// };

// Function to send push notifications
async function sendPushNotifications(
  pushTokens: string[],
  title: string,
  body: string
) {
  const messages = pushTokens
    .filter((token) => Expo.isExpoPushToken(token))
    .map((token) => ({
      to: token,
      sound: "default" as const,
      title,
      body,
      data: { type: "new_booking" },
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      console.log("Push notifications sent successfully to hosts:", ticketChunk);
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }

  return tickets;
}

// Controller to create a new booking and notify hosts
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      pets,
      startDate,
      startTime,
      endDate,
      endTime,
      city,
      location,
      diet,
    } = req.body;
    const userId = (req as any).user?.id; // Assuming user ID is added by authentication middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // Create start and end date times
    const startDateTime = new Date(startDate);
    startDateTime.setHours(
      new Date(startTime).getHours(),
      new Date(startTime).getMinutes()
    );
    const endDateTime = new Date(endDate);
    endDateTime.setHours(
      new Date(endTime).getHours(),
      new Date(endTime).getMinutes()
    );

    // Format pets for storage
    const formattedPets = pets.map((pet: any) => ({
      id: new mongoose.Types.ObjectId(pet.id),
      name: pet.name,
      image: pet.image,
    }));

    // Create new booking
    const newBooking: IBooking = new Booking({
      userId: new mongoose.Types.ObjectId(userId),
      pets: formattedPets,
      startDateTime,
      endDateTime,
      city: city,
      location: {
        type: location.type,
        address: location.address,
      },
      diet,
      acceptedHosts: [],
    });

    // Save the booking
    const savedBooking = await newBooking.save();

    // Find all hosts in the same city
    const hostsInCity: IHostWithPushToken[] = await HostProfileModel.find({
      city: city,
    });

    console.log("hostsInCity", hostsInCity);

    // Filter hosts with valid push tokens
    const pushTokens = hostsInCity
      .filter((host) => host.pushToken)
      .map((host) => host.pushToken as string);

    if (pushTokens.length > 0) {
      // Send push notifications to all hosts in the city
      await sendPushNotifications(
        pushTokens,
        "New Booking Available",
        `A new booking has arrived in ${city}! Check it out now.`
      );
      console.log(
        `Push notifications sent successfully to ${pushTokens.length} hosts in ${city}`
      );
    } else {
      console.log(`No hosts with push tokens found in ${city}`);
    }

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Booking created successfully and hosts notified",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking or sending notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking or notifying hosts",
      error: (error as Error).message,
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    // Validate bookingId
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Fetch the accepted host profiles
    const acceptedHostProfiles = await HostProfile.find({
      userId: {
        $in: booking.acceptedHosts.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    // Create a new object with the booking data and populated acceptedHosts
    const populatedBooking = {
      ...booking.toObject(),
      acceptedHosts: acceptedHostProfiles,
    };

    // Send response with populated booking
    res.status(200).json({
      success: true,
      booking: populatedBooking,
    });
  } catch (error) {
    // Debugging: Log the error
    console.log("Error fetching booking by ID:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the booking.",
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming userId is in request user object

    // Find the bookings for the user and populate the acceptedHosts array
    const bookings = await Booking.find({ userId }).populate({
      path: "acceptedHosts",
      model: HostProfile,
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
    }

    // Send response with populated bookings
    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    // Debugging: Log the error
    console.log("Error fetching bookings:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the bookings.",
    });
  }
};

// Controller to add a host to an accepted hosts list in a booking

export const addAcceptedHost = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = (req as any).user.id; // Get the logged-in user's ID

    // First find the host profile for the logged-in user
    const hostProfile = await HostProfile.findOne({ userId });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found for this user",
      });
    }

    // Find the specific booking by ID and ensure host isn't already accepted
    const booking = await Booking.findOne({
      _id: bookingId,
      acceptedHosts: { $ne: userId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or host already accepted",
      });
    }

    // Add the host profile ID to the acceptedHosts array
    booking.acceptedHosts.push(userId);

    // Save the updated booking
    await booking.save();

    // Populate the acceptedHosts field before sending response
    const populatedBooking = await Booking.findById(booking._id).populate(
      "acceptedHosts"
    );

    res.status(200).json({
      success: true,
      message: "Host profile added as an accepted host",
      booking: populatedBooking,
    });
  } catch (error) {
    console.log("Error adding accepted host:", error);
    res.status(500).json({
      success: false,
      message: "Error adding accepted host",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const declineHost = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body; // Booking ID from the request body
    const userId = (req as any).user.id; // Get the logged-in user's ID from the request

    // Find the host profile associated with the logged-in user
    const hostProfile = await HostProfile.findOne({ userId });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found for this user",
      });
    }

    // Remove the host ID from the `acceptedHosts` array in the specified booking
    await Booking.updateOne({ $pull: { acceptedHosts: hostProfile._id } });

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: "Host profile declined successfully",
    });
  } catch (error) {
    console.log("Error declining host:", error);

    // Handle unexpected errors gracefully
    res.status(500).json({
      success: false,
      message: "An error occurred while declining the host",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Additional controller for updating the accepted hosts (if necessary)
export const updateAcceptedHosts = async (req: Request, res: Response) => {
  try {
    const { bookingId, acceptedHosts } = req.body; // New hosts to add
    const userId = (req as any).user.id; // The user making the request

    // Find the booking by its ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if the logged-in user is authorized to update this booking's accepted hosts
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this booking",
      });
    }

    // Update the acceptedHosts array with the new hosts
    booking.acceptedHosts = acceptedHosts;

    // Save the updated booking
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Accepted hosts updated successfully",
      booking,
    });
  } catch (error) {
    console.log("Error updating accepted hosts:", error);
    res.status(500).json({
      success: false,
      message: "Error updating accepted hosts",
      error: (error as Error).message,
    });
  }
};

export const updateBookingWithSelectedHost = async (
  req: Request,
  res: Response
) => {
  const { selectedHostIds } = req.body;
  console.log("backend selected", selectedHostIds);
  const userId = req.user?.id; // Assuming req.user._id contains the authenticated user's ID

  try {
    if (!selectedHostIds || selectedHostIds.length === 0) {
      return res.status(400).json({ message: "No hosts selected." });
    }

    // Check that each host ID is valid and exists
    const validHosts = await HostProfile.find({
      userId: { $in: selectedHostIds },
    });

    if (validHosts.length !== selectedHostIds.length) {
      return res.status(400).json({ message: "Invalid selected host ID" });
    }

    // Update booking with the selected hosts
    await Booking.updateMany(
      { userId },
      { $set: { selectedHost: selectedHostIds[0] } } // Or store multiple IDs if necessary
    );

    res.json({ success: true, message: "Booking confirmed successfully" });
  } catch (error) {
    console.log("Error in confirmBooking:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const getBilling = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body; // Assuming `req.user` contains the authenticated user

    // Step 1: Retrieve bookings for the authenticated user
    const booking = await Booking.find({ _id: bookingId }).lean(); // Use `lean()` for better performance

    // if (!bookings || bookings.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No bookings found for this user.",
    //   });
    // }

    // // Step 2: Extract unique `selectedHost` IDs from the bookings
    // const selectedHostIds = [
    //   ...new Set(bookings.map((booking) => booking.selectedHost).filter(Boolean)),
    // ];

    // if (selectedHostIds.length === 0) {
    //   return res.status(404).json({
    //     success: true,
    //     message: "No hosts found for the user's bookings.",
    //     bookings: bookings.map((booking) => ({ ...booking, hostDetails: null })),
    //   });
    // }

    // Step 3: Fetch host profiles where userId matches `selectedHost`
    const host = await HostProfile.find({
      userId: booking[0].selectedHost,
    }); // Exclude _id and __v for cleaner response

    // // Step 4: Map host details to corresponding bookings
    // const bookingsWithHostDetails = bookings.map((booking) => {
    //   const hostDetails = hosts.find(
    //     (host) => String(host.userId) === String(booking.selectedHost)
    //   );
    //   return {
    //     ...booking,
    //     hostDetails: hostDetails || null, // Add host details or null if not found
    //   };
    // });

    // Step 5: Send the response with the enriched bookings
    return res.status(200).json({
      success: true,
      message: "Billing details retrieved successfully.",
      bookings: { ...booking[0], selectedHost: host[0] },
    });
  } catch (error) {
    console.log("Error fetching billing details:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving billing details.",
    });
  }
};

export const getRequestBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Get the authenticated user's ID from the request object
    console.log(userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    // Fetch all bookings where `acceptedHosts` is empty or undefined
    const bookings = await Booking.find({
      acceptedHosts: { $nin: [userId] }, // Exclude bookings with the user's ID in `acceptedHosts`
    })
      .populate({
        path: "userId",
        model: User,
        select: "city fullname email", // Populate required user fields
      })
      .populate({
        path: "acceptedHosts",
        model: HostProfile,
        select: "city fullName email", // Populate required host fields
      });

    // if (!bookings || bookings.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No unaccepted bookings found.",
    //   });
    // }

    // // Filter bookings where the user's city matches any host's city
    // const filteredBookings = bookings.filter((booking) => {
    //   const userCity = booking.userId?.city;
    //   if (!userCity) return false; // Skip if the user has no city
    //   const hostCities = booking.acceptedHosts.map((host) => host.city);
    //   return hostCities.includes(userCity);
    // });

    // if (filteredBookings.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No unaccepted bookings with matching cities found.",
    //   });
    // }

    // Send the filtered bookings in the response
    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(
      "Error fetching unaccepted bookings with matching cities:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the bookings.",
    });
  }
};

// export const getUserRelatedBookings = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     // Fetch the logged-in user's details
//     const loggedInUser = await userModel.findById(userId);

//     if (!loggedInUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Logged-in user details not found",
//       });
//     }

//     const hostProfile = await HostProfile.findOne({ userId });
//     let data;
//     let message;

//     if (hostProfile) {

//       const bookings = await Booking.find({
//         selectedHost: hostProfile.userId,
//         paymentStatus: "completed",
//       })
//         .populate("userId", "name email phone")
//         .select("userId");

//       data = bookings.map((booking) => booking.userId);
//       message = "Pet parent details for bookings where you are the host";

//       return res.status(200).json({
//         success: true,
//         message,
//         loggedInUser,
//         petParents: data,
//       });
//     } else {
//       const bookings = await Booking.find({
//         userId,
//         paymentStatus: "completed",
//       });

//       const hosts = await Promise.all(
//         bookings.map((booking) => HostProfile.findById({userId: booking.selectedHost}))
//       );

//       data = bookings.map((booking) => booking.selectedHost);
//       message = "Host details for bookings created by you";

//       return res.status(200).json({
//         success: true,
//         message,
//         loggedInUser,
//         hosts: data,
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// export const getUserRelatedBookings = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.id;

//     // Check if userId exists
//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     // Fetch the logged-in user's details
//     const loggedInUser = await userModel.findById(userId);
//     if (!loggedInUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Logged-in user details not found",
//       });
//     }

//     // Check if the user is a host
//     const hostProfile = await HostProfile.findOne({ userId });
//     if (hostProfile) {
//       // Fetch bookings where the user is the selected host
//       const bookings = await Booking.find({
//         selectedHost: userId,
//         paymentStatus: "completed",
//       })
//         .populate("userId", "name email phone") // Populate pet parent details
//         .select("userId"); // Only return userId and populated data

//       const petParents = bookings.map((booking) => booking.userId); // Extract populated user details
//       const transformedPetParents = petParents.map((parent) => ({
//         userId: parent._id,
//         email: parent.email,
//       }));

//       return res.status(200).json({
//         success: true,
//         message: "Pet parent details for bookings where you are the host",
//         loggedInUser,
//         petParents: transformedPetParents,
//       });
//     }

//     // If the user is not a host, fetch bookings they created
//     const bookings = await Booking.find({
//       userId,
//       paymentStatus: "completed",
//     });

//     // Fetch HostProfile details for each booking's selectedHost
//     const hosts = await Promise.all(
//       bookings.map(async (booking) => {
//         const host = await HostProfile.findOne({
//           userId: booking.selectedHost,
//         });
//         return host ? host.toObject() : null; // Return host details if found
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Host details for bookings created by you",
//       loggedInUser,
//       hosts: hosts.filter((host) => host !== null), // Exclude null values if any
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getUserRelatedBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch the logged-in user's details
    const loggedInUser = await userModel.findById(userId);
    if (!loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "Logged-in user details not found",
      });
    }

    // Check if the user is a host
    const hostProfile = await HostProfile.findOne({ userId });
    if (hostProfile) {
      // Fetch bookings where the user is the selected host
      const bookings = await Booking.find({
        selectedHost: userId,
        paymentStatus: "completed",
      })
        .populate("userId", "name email phone") // Populate pet parent details
        .select("userId"); // Only return userId and populated data

      const uniquePetParents = new Set();
      const transformedPetParents: { userId: Types.ObjectId; email: any }[] =
        [];

      bookings.forEach((booking) => {
        const parent = booking.userId;
        if (parent && !uniquePetParents.has(parent._id.toString())) {
          uniquePetParents.add(parent._id.toString());
          transformedPetParents.push({
            userId: parent._id,
            email: parent.email,
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: "Pet parent details for bookings where you are the host",
        loggedInUser,
        petParents: transformedPetParents,
      });
    }

    // If the user is not a host, fetch bookings they created
    const bookings = await Booking.find({
      userId,
      paymentStatus: "completed",
    });

    // Fetch HostProfile details for each booking's selectedHost
    const uniqueHosts = new Set();
    const hosts = (
      await Promise.all(
        bookings.map(async (booking) => {
          const host = await HostProfile.findOne({
            userId: booking.selectedHost,
          });
          if (host && !uniqueHosts.has(host.userId.toString())) {
            uniqueHosts.add(host.userId.toString());
            return host.toObject();
          }
          return null;
        })
      )
    ).filter((host) => host !== null); // Exclude null values if any

    return res.status(200).json({
      success: true,
      message: "Host details for bookings created by you",
      loggedInUser,
      hosts,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingEndDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const otherUser = req.body.participantId;

    // Check if the user is a host
    const hostProfile = await HostProfile.findOne({ userId });

    if (hostProfile) {
      const booking = await Booking.find({
        userId: otherUser,
        selectedHost: userId,
        paymentStatus: "completed",
      })
        .sort({ createdAt: -1 })
        .limit(1);
      
      return res.status(200).json({
        success: true,
        message: "Host user booking",
        booking,
      });
    } else {
      const booking = await Booking.find({
        userId: userId,
        selectedHost: otherUser,
        paymentStatus: "completed",
      })
        .sort({ createdAt: -1 })
        .limit(1);

      return res.status(200).json({
        success: true,
        message: "Pet Parents user booking",
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};


