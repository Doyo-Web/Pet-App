import { app, server } from "./app";
import dotenv from "dotenv";
import connectDB from "./utils/db";

dotenv.config();

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error);
    process.exit(1);
  });
