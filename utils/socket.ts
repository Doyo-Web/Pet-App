import { io } from "socket.io-client";
import Constants from "expo-constants";

export const createSocketConnection = () => {
  const isLocalhost = Constants.expoConfig?.hostUri?.includes("localhost");
  return io(
    isLocalhost
      ? "http://192.168.108.182:8000"
      : "https://pet-app-4oso.onrender.com",
    { transports: ["websocket"] }
  );
};
