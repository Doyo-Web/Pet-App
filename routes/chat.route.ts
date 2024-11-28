import { Router } from "express";
import { createChat, getChatMessages } from "../controllers/chat.controller";

const router = Router();

router.post("/chat", createChat); // Create a new chat room
router.get("/chat/:roomId", getChatMessages); // Get chat messages by roomId

export default router;
