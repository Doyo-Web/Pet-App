import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Booking model
export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  pets: Array<{
    id: mongoose.Types.ObjectId;
    name: string;
    image: string;
  }>;
  startDateTime: Date;
  endDateTime: Date;
  location: {
    type: string;
    address: string;
  };
  diet: "packed" | "home";
  acceptedHosts: mongoose.Types.ObjectId[]; // References HostProfile
}

// Define the booking schema
const bookingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    pets: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Pet", // Reference to the Pet model
        },
        name: String,
        image: String,
      },
    ],
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    diet: {
      type: String,
      enum: ["packed", "home"],
      required: true,
    },
    acceptedHosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "HostProfile", // Reference to the HostProfile model
      },
    ],
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` timestamps
);

// Export the Booking model
export default mongoose.model<IBooking>("Booking", bookingSchema);
