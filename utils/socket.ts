import { Server } from "socket.io";
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
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
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
      }: SendMessagePayload) => {
        try {
          const roomId = getSecretRoomId(userId, LoggedInuserId);
          console.log(`${fullname} ${text}`);

          io.to(roomId).emit("messageReceived", { fullname, text });
        } catch (err) {
          console.error("Error saving message:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export default initializeSocket;
