import { io } from "socket.io-client";
import Constants from "expo-constants";

export const createSocketConnection = () => {
  const isLocalhost =
    Constants.expoConfig?.hostUri?.includes("localhost") ||
    Constants.expoConfig?.hostUri?.includes("192.168.");

  if (isLocalhost) {
    return io("http://192.168.47.182:8000");
  } else {
    return io("/", { path: "/api/socket.io" });
  }
};
