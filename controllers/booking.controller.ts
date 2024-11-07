import { Request, Response } from "express";
import Booking, { IBooking } from "../models/booking.model";
import HostProfile from "../models/hostprofile.model";

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
    const userId = (req as any).user.id; // Get the logged-in user's ID

    // First find the host profile for the logged-in user
    const hostProfile = await HostProfile.findOne({ userId });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found for this user",
      });
    }

    // Find a booking where the host profile is not already accepted
    const booking = await Booking.findOne({
      userId,
      acceptedHosts: { $ne: hostProfile._id }, // Check against host profile ID instead of userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No available booking for this user",
      });
    }

    // Add the host profile ID to the acceptedHosts array
    booking.acceptedHosts.push(hostProfile.id);

    // Save the updated booking
    await booking.save();

    // Populate the acceptedHosts field before sending response
    const populatedBooking = await booking.populate({
      path: "acceptedHosts",
    });

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
      error: (error as Error).message,
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
