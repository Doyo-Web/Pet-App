import { NextFunction, Request, Response } from "express";
import Chat, { IChat } from "../models/chat.model";
import userModel, { IUser } from "../models/user.model";
import HostProfile from "../models/hostprofile.model";

import Booking, { IBooking } from "../models/booking.model";

export const getChatList = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming you have authentication middleware
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "fullName avatar")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat list", error });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId).populate(
      "messages.sender",
      "fullName avatar"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat messages", error });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user?.id; // Assuming you have authentication middleware

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = newMessage;
    await chat.save();

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = req.user?.id; // Assuming you have authentication middleware

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const newChat = new Chat({
      participants: [userId, participantId],
      messages: [],
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Error creating chat", error });
  }
};

export const getUserRelatedBookings = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Assuming req.user is populated by isAuthenticated middleware

  // Check if the user has a host profile
  const hostProfile = await HostProfile.findOne({ userId });
  let data;

  if (hostProfile) {
    // User is a host
    const bookings = await Booking.find({
      selectedHost: hostProfile._id,
      paymentStatus: "completed",
    })
      .populate("userId", "name email phone") // Fetch pet parent details
      .select("userId");

    data = bookings.map((booking) => booking.userId);

    return res.status(200).json({
      success: true,
      message: "Pet parent details for bookings where you are the host",
      petParents: data,
    });
  } else {
    // User is a pet parent
    const bookings = await Booking.find({
      userId,
      paymentStatus: "completed",
    })
      .populate("selectedHost", "name email phone") // Fetch host details
      .select("selectedHost");

    data = bookings.map((booking) => booking.selectedHost);

    return res.status(200).json({
      success: true,
      message: "Host details for bookings created by you",
      hosts: data,
    });
  }
};



