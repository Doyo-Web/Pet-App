import { Request, Response } from "express";
import Chat from "../models/chat.model";

// Create a new chat or return the existing chat room
export const createChat = async (req: Request, res: Response) => {
  const { userId, hostId } = req.body;

  try {
    let chat = await Chat.findOne({ participants: { $all: [userId, hostId] } });

    if (!chat) {
      chat = new Chat({ participants: [userId, hostId], messages: [] });
      await chat.save();
    }

    res.status(200).json({ success: true, chat });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat messages by roomId
export const getChatMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const chat = await Chat.findById(roomId).populate(
      "messages.sender",
      "fullName"
    );
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
