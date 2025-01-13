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

    // Check if the user is already a participant in any chat with the given participant
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    // If the user is already part of an existing chat with the participant
    if (existingChat) {
      return res.json(existingChat); // Return the existing chat
    }

    // Check if the user is part of any chat at all
    const userChat = await Chat.findOne({
      participants: userId,
    });

    // If the user has chats, return an existing one
    if (userChat) {
      return res.json(userChat); // Return the existing chat
    }

    // If no chat exists, create a new chat
    const newChat = new Chat({
      participants: [userId, participantId],
      messages: [], // Initialize with an empty messages array
    });

    await newChat.save(); // Save the new chat

    res.status(201).json(newChat); // Return the new chat
  } catch (error) {
    res.status(500).json({ message: "Error creating chat", error });
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
