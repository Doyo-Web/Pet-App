import multer from "multer";

// Use memory storage or disk storage as needed
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 5 MB (adjust as needed)
});

// Ensure you use the correct field name ("petImages" should match your FormData)
export const uploadPetImages = upload.array("petImages", 4); // Adjust as needed
