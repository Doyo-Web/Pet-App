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
import { ErrorMiddleware } from "./middleware/error";

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
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

export { app, server, io };