import { Server } from "socket.io";
import crypto from "crypto";

interface JoinChatPayload {
  fullName: string;
  userId: string;
  LoggedInuserId: string;
}

interface SendMessagePayload {
  fullName: string;
  userId: string;
  LoggedInuserId: string;
  text: string;
  contentType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  messageId: string;
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

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on(
      "joinChat",
      ({ fullName, userId, LoggedInuserId }: JoinChatPayload) => {
        const roomId = getSecretRoomId(userId, LoggedInuserId);
        console.log(`${fullName} joined Room: ${roomId}`);
        socket.join(roomId);
      }
    );

    socket.on(
      "sendMessage",
      ({
        fullName,
        userId,
        LoggedInuserId,
        text,
        contentType,
        mediaUrl,
        messageId,
      }: SendMessagePayload) => {
        try {
          const roomId = getSecretRoomId(userId, LoggedInuserId);

          socket.to(roomId).emit("messageReceived", {
            _id: messageId,
            sender: {
              _id: LoggedInuserId,
              fullName: fullName,
            },
            content: text,
            contentType,
            mediaUrl,
            timestamp: new Date().toISOString(),
          });

          console.log(`${fullName} sent ${contentType}: ${text}`);
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
