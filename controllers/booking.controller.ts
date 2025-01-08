import { Request, Response } from "express";
import Booking, { IBooking } from "../models/booking.model";
import HostProfile from "../models/hostprofile.model";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import User from "../models/user.model";

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
    console.error("Error creating Razorpay order:", error);
    res
      .status(500)
      .json({
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
    console.error("Error saving payment details:", error);
    res.status(500).json({ error: "Failed to save payment details" });
  }
};









// Controller to create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { pets, startDate, startTime, endDate, endTime, location, diet } =
      req.body;
    const userId = (req as any).user.id; // Extract the logged-in user's ID

    // Create start and end date times from the provided date and time
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

    // Ensure pets have the correct structure for storing
    const formattedPets = pets.map((pet: any) => ({
      id: pet.id,
      name: pet.name,
      image: pet.image,
    }));

    // Create a new booking instance
    const newBooking: IBooking = new Booking({
      userId,
      pets: formattedPets,
      startDateTime,
      endDateTime,
      location: {
        type: location.type,
        address: location.address,
      },
      diet,
      acceptedHosts: [], // Initialize with an empty array, to be populated later
    });

    // Save the new booking to the database
    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
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

    // Find the booking by ID and populate the acceptedHosts field
    const booking = await Booking.findById(bookingId).populate({
      path: "acceptedHosts",
      model: HostProfile,
    });

    // Debugging: Log the populated booking
    console.log("Populated Booking:", JSON.stringify(booking, null, 2));

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Send response with populated booking
    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    // Debugging: Log the error
    console.error("Error fetching booking by ID:", error);

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

    // Debugging: Log the populated bookings
    console.log("Populated Bookings:", JSON.stringify(bookings, null, 2));

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
    console.error("Error fetching bookings:", error);

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
      acceptedHosts: { $ne: hostProfile._id },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or host already accepted",
      });
    }

    // Add the host profile ID to the acceptedHosts array
    booking.acceptedHosts.push(hostProfile.id);

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
    console.error("Error adding accepted host:", error);
    res.status(500).json({
      success: false,
      message: "Error adding accepted host",
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
    console.error("Error updating accepted hosts:", error);
    res.status(500).json({
      success: false,
      message: "Error updating accepted hosts",
      error: (error as Error).message,
    });
  }
};


export const updateBookingWithSelectedHost = async (req: Request, res: Response) => {
  const { selectedHostIds } = req.body;
  const userId = req.user?.id; // Assuming req.user._id contains the authenticated user's ID

  try {
    if (!selectedHostIds || selectedHostIds.length === 0) {
      return res.status(400).json({ message: "No hosts selected." });
    }

    // Check that each host ID is valid and exists
    const validHosts = await HostProfile.find({
      _id: { $in: selectedHostIds },
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
    console.error("Error in confirmBooking:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};


export const getBilling = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming userId is in request user object

    // Find the bookings for the user and populate the acceptedHosts array
    const bookings = await Booking.find({ userId }).populate({
      path: "selectedHost",
      model: HostProfile,
    });

    // Debugging: Log the populated bookings
    console.log("Populated Bookings:", JSON.stringify(bookings, null, 2));

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
    console.error("Error fetching bookings:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the bookings.",
    });
  }
}


export const getRequestBooking = async (req: Request, res: Response) => {
  try {
    // Fetch all bookings where `acceptedHosts` is empty or undefined
    const bookings = await Booking.find()
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

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No unaccepted bookings found.",
      });
    }

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
      bookings
    });
  } catch (error) {
    console.error(
      "Error fetching unaccepted bookings with matching cities:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the bookings.",
    });
  }
};
