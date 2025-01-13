import express from "express";
import {
  getChatList,
  getChatMessages,
  sendMessage,
  createChat,
} from "../controllers/chat.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.get("/list", isAuthenticated, getChatList);
router.get("/:chatId/messages", isAuthenticated, getChatMessages);
router.post("/:chatId/messages", isAuthenticated, sendMessage);
router.post("/create", isAuthenticated, createChat);

export default router;
