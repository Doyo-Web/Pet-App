import { Server, Socket } from "socket.io";
import crypto from "crypto";
import Chat from "../models/chat.model";

interface JoinChatPayload {
  fullname: string;
  userId: string;
  LoggedInuserId: string;
}

interface SendMessagePayload {
  fullname: string;
  userId: string;
  LoggedInuserId: string;
  text: string;
  contentType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
}

const getSecretRoomId = (userId: string, LoggedInuserId: string): string => {
  return crypto
    .createHash("sha256")
    .update([userId, LoggedInuserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server: any): void => {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    socket.on(
      "joinChat",
      ({ fullname, userId, LoggedInuserId }: JoinChatPayload) => {
        const roomId = getSecretRoomId(userId, LoggedInuserId);
        console.log(`${fullname} joined Room: ${roomId}`);
        socket.join(roomId);
      }
    );

    socket.on(
      "sendMessage",
      async ({
        fullname,
        userId,
        LoggedInuserId,
        text,
        contentType,
        mediaUrl,
      }: SendMessagePayload) => {
        try {
          const roomId = getSecretRoomId(userId, LoggedInuserId);

          const chat = await Chat.findOne({
            participants: { $all: [userId, LoggedInuserId] },
          });

          if (!chat) throw new Error("Chat not found");

          const newMessage = {
            sender: LoggedInuserId,
            content: text,
            contentType,
            mediaUrl,
            timestamp: new Date(),
          };

          chat.messages.push(newMessage);
          chat.lastMessage = newMessage;
          await chat.save();

          io.to(roomId).emit("messageReceived", {
            _id: newMessage.timestamp.toISOString(),
            sender: {
              _id: LoggedInuserId,
              fullName: fullname,
            },
            content: text,
            contentType,
            mediaUrl,
            timestamp: newMessage.timestamp.toISOString(),
          });

          console.log(`${fullname} sent ${contentType}: ${text}`);
        } catch (err) {
          console.error("Error handling message:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export default initializeSocket;
