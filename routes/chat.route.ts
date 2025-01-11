import express from "express";
import {
  getChatList,
  getChatMessages,
  sendMessage,
  createChat,
  getUserRelatedBookings,
} from "../controllers/chat.controller";
import { isAuthenticated } from "../middleware/auth"; // Assuming you have an authentication middleware

const router = express.Router();

router.get("/list", isAuthenticated, getChatList);
router.get("/:chatId/messages", isAuthenticated, getChatMessages);
router.post("/send", isAuthenticated, sendMessage);
router.post("/create", isAuthenticated, createChat);
router.get("/user-related-bookings", isAuthenticated, getUserRelatedBookings);

export default router;
