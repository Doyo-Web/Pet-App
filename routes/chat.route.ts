import { Router } from "express";
import {
  createChat,
  getChatMessages,
  sendMessage,
  closeChat,
} from "../controllers/chat.controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.post("/chat", isAuthenticated, createChat);
router.get("/chat/:bookingId", isAuthenticated, getChatMessages);
router.post("/chat/message", isAuthenticated, sendMessage);
router.post("/chat/close", isAuthenticated, closeChat);

export default router;
