import { app } from "./app";

import dotenv from "dotenv";
import connectDB from "./utils/db";

dotenv.config();


//Create Server
app.listen(process.env.PORT, () => {
    console.log(`server running on PORT ${process.env.PORT}`);
    connectDB();
})

