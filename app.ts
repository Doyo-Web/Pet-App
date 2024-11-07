import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
export const app = express();
import bodyParser from "body-parser";
import multer from "multer";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import petprofileRouter from "./routes/petprofile.route";
import hostProfileRouter from "./routes/hostprofile.route";
import BookingRouter from "./routes/booking.route";

app.use(express.json({ limit: "10mb" })); // Adjust the size limit as needed

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // limit file size to 10MB
});

app.use(upload.fields([{ name: 'petImages', maxCount: 10 }]));

//cookie parser
app.use(cookieParser());

//Cors
app.use(cors());

//routes

app.use("/api/v1", userRouter);
app.use("/api/v1", petprofileRouter);
app.use("/api/v1", hostProfileRouter);
app.use("/api/v1", BookingRouter);

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