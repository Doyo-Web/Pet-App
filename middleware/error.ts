import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';
        
    //Wrong MongoDB ID Error
    if(err.name === 'CastError') {
        const message = `Resource not found. Invalid ${err.path}`
        err = new ErrorHandler(message, 400)
    };

    //Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    //wrong JWT Error
    if (err.name === 'JsonWebTokenError') {
        const message = `Json web token is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }

    //JWT Expire Error
    if (err.name === 'TokenExpiredError') {
        const message = `Json web token is Expired, try again`;
        err = new ErrorHandler(message, 413);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
  

}