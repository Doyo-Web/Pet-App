import type { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Booking from "../models/booking.model";
import Payment from "../models/payment.model";
import { processPaymentToWallet } from "./wallet.controller";
import { IUser } from "../models/user.model"; // Import the actual IUser interface

// Define interfaces for your models
interface IPayment {
  bookingId: mongoose.Types.ObjectId;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway: string;
  paymentDetails: any;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Request type to include rawBody
interface RequestWithRawBody extends Request {
  rawBody?: string;
  user?: IUser; // Use the imported IUser interface
}

// Environment variables
const CASHFREE_API_KEY =
  process.env.CASHFREE_API_KEY || "TEST4292542431f62aaeb540a114d0452924";
const CASHFREE_SECRET_KEY =
  process.env.CASHFREE_SECRET_KEY ||
  "TEST43af830766688976320c9e300d719b02965d3bc2";
const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

// Create a new payment order
export const createOrder = async (req: RequestWithRawBody, res: Response) => {
  try {
    const {
      bookingId,
      amount,
      currency,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    console.log("Create order request body:", req.body);

    if (
      !bookingId ||
      !amount ||
      !currency ||
      !customerName ||
      !customerPhone ||
      !customerEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create payment link directly using Cashfree's payment links API
    const paymentLinkPayload = {
      link_id: orderId,
      link_amount: Number.parseFloat(amount),
      link_currency: currency,
      link_purpose: `Payment for booking ${bookingId}`,
      customer_details: {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      link_meta: {
        booking_id: bookingId,
        user_id: req.user?._id ? req.user._id.toString() : "guest_user",
      },
      link_notify: {
        send_sms: false,
        send_email: false,
      },
      link_partial_payments: false,
      link_minimum_partial_amount: 0,
      link_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      link_auto_reminders: false,
      link_notes: {
        booking_id: bookingId,
      },
    };

    console.log("Payment link payload:", JSON.stringify(paymentLinkPayload));

    const response = await axios.post(
      `${CASHFREE_BASE_URL}/links`,
      paymentLinkPayload,
      {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": CASHFREE_API_KEY,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Cashfree payment link response:",
      JSON.stringify(response.data)
    );

    if (!response.data || !response.data.link_url) {
      throw new Error("Invalid response from payment gateway");
    }

    // Save payment details in database
    const payment = new Payment({
      bookingId,
      orderId,
      amount: Number.parseFloat(amount),
      currency,
      status: "CREATED",
      paymentGateway: "CASHFREE",
      paymentDetails: response.data,
      createdBy: req.user?._id,
    });

    await payment.save();

    // Return payment link and order ID
    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentLink: response.data.link_url,
    });
  } catch (error: any) {
    console.error("Error creating payment order:", error);

    // Log detailed error information
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request:", error.request);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Check payment status from database first
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If payment is already marked as PAID, return the status
    if (payment.status === "PAID") {
      return res.status(200).json({
        success: true,
        status: payment.status,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    // Otherwise, check with Cashfree for the latest status
    const response = await axios.get(`${CASHFREE_BASE_URL}/links/${orderId}`, {
      headers: {
        "x-api-version": "2022-09-01",
        "x-client-id": CASHFREE_API_KEY,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
    });

    console.log("Payment status response:", JSON.stringify(response.data));

    // Map Cashfree link status to our payment status
    let paymentStatus = "CREATED";
    if (response.data.link_status === "PAID") {
      paymentStatus = "PAID";
    } else if (response.data.link_status === "EXPIRED") {
      paymentStatus = "FAILED";
    }

    // Update payment status in database
    if (paymentStatus === "PAID") {
      payment.status = "PAID";
      payment.paymentDetails = response.data;
      await payment.save();

      // Update booking payment status
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: "completed",
        paymentDate: new Date(),
        paymentDetails: {
          paymentId: response.data.payments?.[0]?.payment_id || "",
          orderId: payment.orderId,
          signature: response.data.payments?.[0]?.bank_reference || "",
          amount: payment.amount,
        },
      });

      // Process payment to host wallet
      // Cast _id to string to fix the 'unknown' type error
      const paymentId =
        payment._id instanceof mongoose.Types.ObjectId
          ? payment._id.toString()
          : String(payment._id);

      await processPaymentToWallet(payment.bookingId.toString(), paymentId);
    }

    return res.status(200).json({
      success: true,
      status: paymentStatus,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error: any) {
    console.error("Error getting payment status:", error);

    // Log detailed error information
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Handle webhook notifications from Cashfree
export const handleWebhook = async (req: RequestWithRawBody, res: Response) => {
  try {
    const payload = req.rawBody || JSON.stringify(req.body);
    console.log("Webhook received:", JSON.stringify(req.body, null, 2));

    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    // Skip signature validation in development for testing
    if (process.env.NODE_ENV !== "development") {
      if (!signature || typeof signature !== "string") {
        console.warn("Webhook signature missing");
        return res
          .status(401)
          .json({ success: false, message: "Missing signature" });
      }

      if (!process.env.CASHFREE_SECRET_KEY) {
        console.error("CASHFREE_SECRET_KEY is not set");
        return res
          .status(500)
          .json({ success: false, message: "Server configuration error" });
      }

      // Validate Webhook Signature using HMAC
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(timestamp + payload);
      const expectedSignature = hmac.digest("base64");

      if (signature !== expectedSignature) {
        console.warn("Invalid webhook signature");
        return res
          .status(403)
          .json({ success: false, message: "Invalid signature" });
      }
    }

    // Extract necessary data from webhook payload
    const { order, payment } = req.body.data;
    const cashfreeOrderId = order?.order_id; // Cashfree's order ID (CFPay_*)
    const linkOrderId = order?.order_tags?.link_id; // Our original order ID
    const bookingId = order?.order_tags?.booking_id;
    const paymentStatus = payment?.payment_status;

    if (!cashfreeOrderId || !bookingId) {
      console.warn("Missing order ID or booking ID in webhook data");
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook data" });
    }

    console.log(
      `Processing payment for Order ID: ${cashfreeOrderId}, Booking ID: ${bookingId}, Status: ${paymentStatus}`
    );

    // First try to find payment by the link_id from order_tags
    let existingPayment = null;
    if (linkOrderId) {
      existingPayment = await Payment.findOne({ orderId: linkOrderId });
    }

    // If not found, try to find by booking ID
    if (!existingPayment) {
      existingPayment = await Payment.findOne({ bookingId });
      console.log(
        `Payment record not found for Order ID: ${cashfreeOrderId}`,
        existingPayment
      );
    }

    // If still not found, create a new payment record
    if (!existingPayment) {
      const booking = await Booking.findById(bookingId);
      console.log(booking);

      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      // Create a new payment record based on the webhook data
      existingPayment = new Payment({
        bookingId,
        orderId: linkOrderId || cashfreeOrderId,
        amount: order.order_amount,
        currency: order.order_currency,
        status: paymentStatus === "SUCCESS" ? "PAID" : "FAILED",
        paymentGateway: "CASHFREE",
        paymentDetails: req.body.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing payment record
      existingPayment.status = paymentStatus === "SUCCESS" ? "PAID" : "FAILED";
      existingPayment.paymentDetails = req.body.data;
      existingPayment.updatedAt = new Date();
    }

    // Save the payment record
    await existingPayment.save();

    // Update Booking Payment Status if payment was successful
    if (paymentStatus === "SUCCESS") {
      // Extract payment details for the booking
      const paymentDetails = {
        paymentId: payment.cf_payment_id.toString(),
        orderId: linkOrderId || cashfreeOrderId,
        signature: payment.bank_reference || payment.auth_id || "",
        amount: payment.payment_amount,
      };

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: "completed",
          paymentDate: new Date(),
          paymentDetails: paymentDetails,
        },
        { new: true }
      );

      if (!updatedBooking) {
        console.warn(`Booking ID ${bookingId} not found for payment update`);
      } else {
        console.log(
          `Payment for Booking ID ${bookingId} marked as completed with details:`,
          paymentDetails
        );

        // Process payment to host wallet
        // Cast _id to string to fix the 'unknown' type error
        const paymentId =
          existingPayment._id instanceof mongoose.Types.ObjectId
            ? existingPayment._id.toString()
            : String(existingPayment._id);

        await processPaymentToWallet(bookingId, paymentId);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
