import { NextFunction, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import bookingModel from "../models/booking.model";


// update Payment Info
export const updatePaymentInfo = catchAsyncError(
  async (data:any, req: Request, res: Response) => {
    const { Id, payment_info } = data;

    if (!Id || !payment_info) {
      return res.status(400).json({
        success: false,
        message: "User ID and payment information are required",
      });
    }

    const booking = await bookingModel.findOneAndUpdate(
      { _id: Id },
      {
        paymentDetails: payment_info,
        paymentStatus: "completed",
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for the given user ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details updated successfully",
      booking,
    });
  }
);

