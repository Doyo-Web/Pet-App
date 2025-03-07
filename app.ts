import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import multer from "multer";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import userRouter from "./routes/user.route";
import petProfileRouter from "./routes/petprofile.route";
import hostProfileRouter from "./routes/hostprofile.route";
import bookingRouter from "./routes/booking.route";
import chatRouter from "./routes/chat.route";
import reviewRouter from "./routes/review.route";
import paymentRouter from "./routes/payment.route";
import { ErrorMiddleware } from "./middleware/error";
import { joinChat, leaveChat } from "./controllers/chat.controller";
import initializeSocket from "./utils/socket";

const app: Application = express();
const server = http.createServer(app);
initializeSocket(server);

// const io = new SocketIOServer(server, { cors: { origin: "*" } });

app.use(cors());
app.use(cookieParser());
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString(); // Store raw body for signature validation
    },
    limit: "200mb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
app.use(upload.fields([{ name: "petImages", maxCount: 10 }]));

// API Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", petProfileRouter);
app.use("/api/v1", hostProfileRouter);
app.use("/api/v1", bookingRouter);
app.use("/api/v1", chatRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1", paymentRouter);

// Testing Route
app.get("/testing", (_, res) => {
  res.status(200).json({ success: true, message: "API is Working" });
});

// Unknown Route Handler
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);

// io.on("connection", (socket) => {
//   console.log("New client connected");

//   socket.on("joinChat", (chatId) => joinChat(socket, chatId));
//   socket.on("leaveChat", (chatId) => leaveChat(socket, chatId));

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

export { app, server };
