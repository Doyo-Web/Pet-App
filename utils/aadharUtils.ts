// utils/aadharUtils.ts
import Tesseract from "tesseract.js";
import sharp from "sharp"; // Import sharp for image processing
import axios from "axios"; // For downloading images
import path from "path"; // For path operations
import fs from "fs"; // To handle file operations

// Extract text from an Aadhaar card image using Tesseract.js
export const extractTextFromImage = async (
  imageUrl: string
): Promise<string> => {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imageUrl, "eng", {
      logger: (m) => console.log(m), // Log progress if needed
    });

    return text;
  } catch (error) {
    console.log("Error during OCR processing: ", error);
    throw new Error("OCR extraction failed.");
  }
};

// Validate Aadhaar number (basic validation using regex)
export const validateAadharNumber = (extractedText: string): boolean => {
  const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/; // Matches 12-digit Aadhaar number
  return aadhaarRegex.test(extractedText);
};

// Implement the image preprocessing function
export const preprocessImage = async (imageBuffer: Buffer) => {
  const outputPath = path.join(
    __dirname,
    "temp",
    `processed-${Date.now()}.jpg`
  );

  // Use sharp to enhance the image quality
  await sharp(imageBuffer)
    .resize(600, 600, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFile(outputPath);

  return outputPath; // Return the path of the processed image
};

// Function to fetch an image buffer from a URL
export const fetchImageBuffer = async (imageUrl: string) => {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(response.data); // Return as Buffer
};

// Helper function to validate if a string is a URL
export const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
