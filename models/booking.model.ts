import mongoose, { Document, Schema } from "mongoose";

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
  acceptedHosts: mongoose.Types.ObjectId[];
  selectedHost: mongoose.Types.ObjectId;
  paymentStatus: "pending" | "completed" | "failed";
  paymentDetails: {
    paymentId: string;
    orderId: string;
    signature: string;
    amount: number;
  };
}

const bookingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pets: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Pet",
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
        ref: "HostProfile",
      },
    ],
    selectedHost: {
      type: Schema.Types.ObjectId,
      ref: "HostProfile",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentDetails: {
      paymentId: String,
      orderId: String,
      signature: String,
      amount: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
