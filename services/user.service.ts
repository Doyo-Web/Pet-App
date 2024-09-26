import { Response } from "express";
import userModel from "../models/user.model";

//Get User by ID
export const getUserById = async (id: any, res: Response) => {
    const user = await userModel.findById({ _id: id });

    res.status(201).json({
      success: true,
      user,
    });
}