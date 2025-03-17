import { Server, Socket } from "socket.io";
import crypto from "crypto";
import { notifyNewMessage } from "./pushNotification";

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

  io.on("connection", (socket: Socket) => {
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
      async ({
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

          const message = {
            _id: messageId,
            sender: {
              _id: LoggedInuserId,
              fullName,
            },
            content: text,
            contentType,
            mediaUrl,
            timestamp: new Date().toISOString(),
          };

          // Emit the message to the room
          socket.to(roomId).emit("messageReceived", message);

          console.log(`${fullName} sent ${contentType}: ${text}`);

          // Send push notification to the recipient (userId)
          await notifyNewMessage(userId, fullName, text);
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
