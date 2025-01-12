import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "./uri";

interface ServerToClientEvents {
  receiveMessage: (message: {
    _id: string;
    sender: string;
    content: string;
    timestamp: string;
  }) => void;
  chatClosed: () => void;
  error: (error: { message: string }) => void;
}

interface ClientToServerEvents {
  joinRoom: (bookingId: string) => void;
  sendMessage: (message: { roomId: string; content: string }) => void;
  closeChat: (bookingId: string) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const initSocket = async (): Promise<
  Socket<ServerToClientEvents, ClientToServerEvents>
> => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem("access_token");
  if (!token) throw new Error("No access token found");

  socket = io(SERVER_URI, {
    query: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const getSocket = (): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
