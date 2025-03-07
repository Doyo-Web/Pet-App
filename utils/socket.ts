import { io } from "socket.io-client";
import Constants from "expo-constants";

export const createSocketConnection = () => {
  const isLocalhost =
    Constants.expoConfig?.hostUri?.includes("localhost") ||
    Constants.expoConfig?.hostUri?.includes("192.168.");

  if (isLocalhost) {
    return io("http://192.168.200.182:8000");
  } else {
    // Connect to your production URL
    return io("https://pet-app-4oso.onrender.com", {
      transports: ["websocket"],
      // Remove the path since it's not needed for your render.com deployment
      // path: "/api/socket.io"
    })
  }
};
