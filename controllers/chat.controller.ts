import { Request, Response } from "express";
import Chat from "../models/chat.model";
import Booking from "../models/booking.model";
import mongoose from "mongoose";

export const createChat = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const userId = (req as any).user.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus !== "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const participants = [userId, booking.selectedHost];
    let chat = await Chat.findOne({ booking: bookingId });

    if (!chat) {
      chat = new Chat({
        booking: bookingId,
        participants,
        messages: [],
        isActive: true,
      });
      await chat.save();
    }

    res.status(200).json({ success: true, chat });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = (req as any).user.id;

  try {
    const chat = await Chat.findById(chatId).populate(
      "messages.sender",
      "fullname"
    );

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (!chat.participants.includes(new mongoose.Types.ObjectId(userId))) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access to chat" });
    }

    res.status(200).json({
      success: true,
      messages: chat.messages,
      isActive: chat.isActive,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, content } = req.body;
  const userId = (req as any).user.id;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (!chat.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Chat is no longer active" });
    }

    if (!chat.participants.includes(new mongoose.Types.ObjectId(userId))) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access to chat" });
    }

    const newMessage = {
      sender: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(200).json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeChat = async (req: Request, res: Response) => {
  const { chatId } = req.body;
  const userId = (req as any).user.id;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (!chat.participants.includes(new mongoose.Types.ObjectId(userId))) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access to chat" });
    }

    chat.isActive = false;
    await chat.save();

    res
      .status(200)
      .json({ success: true, message: "Chat closed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createChat,
  getChatMessages,
  sendMessage,
  closeChat,
};
