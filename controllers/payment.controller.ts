import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/booking.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;


    const userId = req.user?.id;

    const booking = await Booking.findOne({ userId }); 

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: userId,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating payment order" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update booking payment status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "completed",
        paymentDetails: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
