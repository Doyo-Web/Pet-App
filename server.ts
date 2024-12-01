import { app, server, io } from "./app";
import dotenv from "dotenv";
import connectDB from "./utils/db";
import jwt from "jsonwebtoken";
import Chat from "./models/chat.model";

dotenv.config();

const PORT = process.env.PORT || 4000;

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (typeof token === "string") {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      (socket as any).userId = (decoded as any).id;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", (bookingId) => {
    socket.join(bookingId);
    console.log(`User joined room: ${bookingId}`);
  });

  socket.on("sendMessage", async (message) => {
    const { roomId, content } = message;
    const userId = (socket as any).userId;

    try {
      const chat = await Chat.findOne({ booking: roomId });
      if (chat && chat.isActive) {
        const newMessage = {
          sender: userId,
          content,
          timestamp: new Date(),
        };
        chat.messages.push(newMessage);
        await chat.save();
        io.to(roomId).emit("receiveMessage", newMessage);
      } else {
        socket.emit("error", { message: "Chat not found or inactive" });
      }
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Error saving message" });
    }
  });

  socket.on("closeChat", async (bookingId) => {
    try {
      const chat = await Chat.findOne({ booking: bookingId });
      if (chat) {
        chat.isActive = false;
        await chat.save();
        io.to(bookingId).emit("chatClosed");
      }
    } catch (error) {
      console.error("Error closing chat:", error);
      socket.emit("error", { message: "Error closing chat" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start Server after DB Connection
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });
