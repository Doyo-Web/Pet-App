import { NextFunction, Request, Response } from "express";
import Chat, { IChat, IMessage } from "../models/chat.model";

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
    const { content, contentType, mediaUrl } = req.body;
    const senderId = req.user?.id;

    // Check if senderId exists (i.e., user is authenticated)
    if (!senderId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    // Find the chat by ID
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Create the new message object
    const newMessage: IMessage = {
      sender: senderId,
      content,
      contentType: contentType || "text",
      mediaUrl,
      timestamp: new Date(),
    };

    // Add the message to the chat and update lastMessage
    chat.messages.push(newMessage);
    chat.lastMessage = newMessage;
    await chat.save();

    // Retrieve the saved message with its _id (MongoDB generates this)
    const savedMessage = chat.messages[chat.messages.length - 1];

    // Respond with the saved message, including its _id
    res.json(savedMessage);
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
