import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
export const app = express();

import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";


//body Parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

//Cors
app.use(cors());

//routes

app.use("/api/v1", userRouter);

//testing api
app.get("/testing", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is Working"
    });
});

//unknown route
app.get("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleware);