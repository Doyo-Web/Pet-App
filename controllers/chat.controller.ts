import { NextFunction, Request, Response } from "express";
import Chat, { IChat } from "../models/chat.model";
import userModel, { IUser } from "../models/user.model";
import HostProfile from "../models/hostprofile.model";
import Booking, { IBooking } from "../models/booking.model";
import { io } from "../app";

export const getChatList = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.id;

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

    io.to(chatId).emit("message", newMessage);

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = req.user?.id;

    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (existingChat) {
      return res.json(existingChat);
    }

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

export const getUserRelatedBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch the logged-in user's details
    const loggedInUser = await userModel
      .findById(userId);

    if (!loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "Logged-in user details not found",
      });
    }

    const hostProfile = await HostProfile.findOne({ userId });
    let data;
    let message;

    if (hostProfile) {
      const bookings = await Booking.find({
        selectedHost: hostProfile._id,
        paymentStatus: "completed",
      })
        .populate("userId", "name email phone")
        .select("userId");

      data = bookings.map((booking) => booking.userId);
      message = "Pet parent details for bookings where you are the host";

      return res.status(200).json({
        success: true,
        message,
        loggedInUser,
        petParents: data,
      });
    } else {
      const bookings = await Booking.find({
        userId,
        paymentStatus: "completed",
      })
        .populate("selectedHost", "name email phone")
        .select("selectedHost");

      data = bookings.map((booking) => booking.selectedHost);
      message = "Host details for bookings created by you";

      return res.status(200).json({
        success: true,
        message,
        loggedInUser,
        hosts: data,
      });
    }
  } catch (error) {
    next(error);
  }
};


export const joinChat = (socket: any, chatId: string) => {
  socket.join(chatId);
  console.log(`User joined chat: ${chatId}`);
};

export const leaveChat = (socket: any, chatId: string) => {
  socket.leave(chatId);
  console.log(`User left chat: ${chatId}`);
};
