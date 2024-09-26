import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload }  from "jsonwebtoken";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

dotenv.config();

//Authenticated User
export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const access_token = req.cookies.access_token as string;
  console.log(access_token);

  if (!access_token) {
    return next(new ErrorHandler("Please Login to access this Request", 400));
  }

  const decoded = jwt.verify(
    access_token,
    process.env.ACCESS_TOKEN as string
  ) as JwtPayload;

  if (!decoded) {
    return next(new ErrorHandler("Access token is not Valid", 400));
  }

    const user = await userModel.findById({ _id: decoded.id });
  

  if (!user) {
    return next(new ErrorHandler("User not Found", 400));
  }

    req.user = user;
    next();
    

})

//Validate User Role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
    }

    next();
  }
}