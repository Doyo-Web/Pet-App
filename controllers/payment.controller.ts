import type { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import Booking from "../models/booking.model";
import Payment from "../models/payment.model";

// Environment variables
const CASHFREE_API_KEY =
  process.env.CASHFREE_API_KEY || "TEST4292542431f62aaeb540a114d0452924";
const CASHFREE_SECRET_KEY =
  process.env.CASHFREE_SECRET_KEY ||
  "TEST43af830766688976320c9e300d719b02965d3bc2";
const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

// Create a new payment order
export const createOrder = async (req: Request, res: Response) => {
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
        user_id: req.user?._id || "guest_user",
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
      });
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
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log("Webhook received:", JSON.stringify(event));

    console.log("webhook-signature", req.headers["x-webhook-signature"]);
    // Verify webhook signature if provided
    const signature = req.headers["x-webhook-signature"];

    if (signature && typeof signature === "string" && CASHFREE_SECRET_KEY) {
      // Create a signature using the webhook payload and secret key
      const payload = JSON.stringify(event);

      console.log("CASHFREE_SECRET_KEY", CASHFREE_SECRET_KEY);
      const computedSignature = crypto
        .createHmac("sha256", CASHFREE_SECRET_KEY)
        .update(payload)
        .digest("hex");
      
      console.log("computed Signature", computedSignature);

      console.log("signature", signature);

      // Compare signatures
      if (computedSignature !== signature) {
        console.warn("Invalid webhook signature received");
        return res
          .status(401)
          .json({ success: false, message: "Invalid signature" });
      }
    }

    // Process the webhook event for payment links
    if (event.data && event.data.link && event.data.link.link_id) {
      const orderId = event.data.link.link_id;
      const linkStatus = event.data.link.link_status;

      console.log(
        `Processing webhook for link ${orderId} with status ${linkStatus}`
      );

      // Update payment status in database
      const payment = await Payment.findOne({ orderId });

      if (payment) {
        // Map Cashfree link status to our payment status
        let paymentStatus = "CREATED";
        if (linkStatus === "PAID") {
          paymentStatus = "PAID";
        } else if (linkStatus === "EXPIRED") {
          paymentStatus = "FAILED";
        }

        payment.status = paymentStatus;
        payment.paymentDetails = event.data;
        await payment.save();

        // If payment is successful, update booking status
        if (paymentStatus === "PAID") {
          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: "completed",
            paymentDate: new Date(),
          });
          console.log(
            `Payment for booking ${payment.bookingId} marked as completed`
          );
        }
      } else {
        console.warn(`Payment record not found for order ${orderId}`);
      }
    }

    // Acknowledge receipt of webhook
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
