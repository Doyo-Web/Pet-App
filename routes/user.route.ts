import express from "express";
import { activateUser, ChangeUserPassword, DeleteUser, forgotPassword, getUserInfo, loginUser, logoutUser, registrationUser, ResendOtp, updateAccessToken, UpdateUser } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);

userRouter.post("/activate-user", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAuthenticated, logoutUser);

userRouter.get("/refresh", updateAccessToken);

userRouter.get("/me", isAuthenticated, getUserInfo);

userRouter.post("/forgot-password", forgotPassword);

userRouter.post("/resendotp", ResendOtp);

userRouter.put("/update-user", isAuthenticated, UpdateUser);

userRouter.delete("/delete-user", isAuthenticated, DeleteUser);

userRouter.put("/change-password", isAuthenticated, ChangeUserPassword);

export default userRouter;