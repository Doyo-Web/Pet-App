import { Review } from "../models/review.model";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, feedback } = req.body; // Extract rating and feedback from the request body
    const userId = (req as any).user.id; // Extract userId from the authenticated user

    // Validate the presence of required fields
    if (!rating || !feedback) {
      return res
        .status(400)
        .json({ success: false, message: "Rating and feedback are required." });
    }

    // Create a new review instance
    const newReview = new Review({
      userId,
      rating,
      feedback,
    });

    // Save the review to the database
    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: newReview,
    });
  } catch (error: any) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting the review.",
      error: error.message,
    });
  }
};

export const getAllReviewsWithUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Fetch all reviews and populate the fullname and avatar fields of the user
    const reviews = await Review.find()
      .populate("userId", "fullname avatar") // Populate fullname and avatar
      .exec();

    // Return the reviews in the response
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    // Pass the error to the custom error handler
    next(new ErrorHandler("Failed to fetch reviews", 500));
  }
};
