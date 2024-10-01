import dotenv from "dotenv";
import twilio from "twilio";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../services/user.service";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

//Register User
interface IRegistrationBody {
  fullname: string;
  phonenumber: number;
  email: string;
  password: string;
  hearaboutus: string;
}

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

// Create a Twilio client
const client = twilio(accountSid, authToken);

export const registrationUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction)=>{
  try {

      const { fullname, phonenumber, email, password, hearaboutus } =
        req.body;
      
      // const newPhoneNumber = "+91" + phonenumber;

      const isEmailExist = await userModel.findOne({ email: email });

      if (isEmailExist) {
        return next(new ErrorHandler("Email Already Exists", 400));
      }

      const user: IRegistrationBody = {
        fullname,
        phonenumber,
        email,
        password,
        hearaboutus,
      };

      const activationToken = createActivationToken(user);

      // const activationCode = activationToken.activationCode;

      // Function to send OTP
      // async function sendOtp(to: string, otp: string) {
      //   try {
      //     // Create your message content
      //     const messageContent = `Your OTP code is ${otp}. Please use this to complete your login process.`;

      //     // Send the message
      //     const message = await client.messages.create({
      //       body: messageContent,
      //       from: "+19164149222", // Replace with your Twilio phone number
      //       to: newPhoneNumber,
      //     });

      //     console.log("Message sent successfully:", message.sid);
      //   } catch (error) {
      //     console.error("Error sending message:", error);
      //   }
      // }

      // Example usage
      // const recipientNumber = "${user.phonenumber}"; // Replace with the recipient's phone number
      // const otpCode = activationCode; // Replace with the generated OTP

      // sendOtp(recipientNumber, otpCode);

      res.status(201).json({
          success: true,
          message: `OTP Send Successfully`,
          activationToken: activationToken.token,
      });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

interface IActivationToken{
    token: string,
    activationCode: string,
}

export const createActivationToken = (user: any): IActivationToken => {
    // const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const activationCode = "0000"

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: "5d",
    });

    return {token, activationCode }

}

//activate user

interface IActivationRequest {
  activation_token: string,
  activation_code: string,
  
}

export const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activation_token, activation_code } = req.body as IActivationRequest;


    const newUser : { user:IUser; activationCode:string } = jwt.verify(activation_token, process.env.ACTIVATION_SECRET as string) as {
      user: IUser; activationCode: string
    };

    
    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid Activation Code", 400));
    }

    const { fullname, phonenumber, email, password, hearaboutus } =
      newUser.user;
    
  
    const userAlreadyExist = await userModel.findOne({ email: email });

    if (userAlreadyExist) {
      return next(new ErrorHandler("User Already Register with this email", 400));
    };

    const placeholderAvatar = {
      public_id: "1", // Replace with a real placeholder public ID from your image storage
      url: "https://archive.org/download/placeholder-image/placeholder-image.jpg", // Replace with a real URL to the placeholder image
    };
    
      const user = await userModel.create({
        fullname,
        phonenumber,
        email,
        password,
        hearaboutus,
        avatar: placeholderAvatar, // Assign placeholder avatar
        isVerified: true,
      });

    const saveduser = await user.save();

    res.status(201).json({
      success: true,

    })
    } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }

});


//Login User

interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { email, password } = req.body as ILoginRequest;

    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email and Password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid Email or Password", 400));
    }

    sendToken(user, 200, res);
    
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//Logout User
export const logoutUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });

    res.status(200).json({
      success: true,
      message: "Logged out Successfully"
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//Update Access Token
export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const refresh_token = req.headers["refresh_token"] as string;

    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload; 

    const message = "Could not refresh token";

    if (!decoded) {
      return next(new ErrorHandler(message, 400));
    }

    const user = await userModel.findById({ _id: decoded.id });

    if (!user) {
      return next(new ErrorHandler(message, 400));
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
      expiresIn: "5m"
    });

     const refreshToken = jwt.sign(
       { id: user._id },
       process.env.REFRESH_TOKEN as string,
       {
         expiresIn: "7d",
       }
    );
    
    res.cookie("access_token", accessToken, accessTokenOptions);

    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(200).json({
      status: "success",
      accessToken,
    });


  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
})


//Get User Info
export const getUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure userId is defined and is a string
      const userId = req.user?._id;

      // Pass the userId to the getUserById function
      await getUserById(userId, res);

    } catch (error: unknown) {
      if (error instanceof Error) {
        return next(new ErrorHandler(error.message, 400));
      } else {
        return next(new ErrorHandler("An unknown error occurred", 400));
      }
    }
  }
);

//Forgot Password
export const forgotPassword = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {

     const user = await userModel.findOne({ email: email }).select("+password");

     if (!user) {
       return next(new ErrorHandler("User not found", 400));
     }

    const password = generatePassword();

    console.log(password);

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { password: hashedPassword }, // You may want to hash this password
      { new: true, useFindAndModify: false }
    );

    const data = { user: { password: password } };
    

    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation-mail.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Your Password",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `New Password sent to: ${user.email}`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
})

const generatePassword = (length = 8) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

//Resend OTP
export const ResendOtp = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  const { user } = jwt.verify(
    token,
    process.env.ACTIVATION_SECRET as Secret
  ) as JwtPayload;

  const activationToken = createActivationToken(user);

  const activationCode = activationToken.activationCode;

  const newPhoneNumber = "+91" + user.phonenumber;

  // Function to send OTP
  async function sendOtp(to: string, otp: string) {
    try {
      // Create your message content
      const messageContent = `Your OTP code is ${otp}. Please use this to complete your login process.`;

      // Send the message
      const message = await client.messages.create({
        body: messageContent,
        from: "+19164149222", // Replace with your Twilio phone number
        to: newPhoneNumber,
      });

      console.log("Message sent successfully:", message.sid);

      res.status(201).json({
        success: true,
        message: `OTP Send Successfully Again`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Example usage
  const recipientNumber = user.phonenumber; // Replace with the recipient's phone number
  const otpCode = activationCode; // Replace with the generated OTP

  sendOtp(recipientNumber, otpCode);
})

//Update User Details

// Cloudinary configuration (add your credentials here)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const UpdateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?._id; // Extract user ID from req.user

    const { avatar, fullname, phonenumber, email, profession } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Initialize an object to hold updates
    const updateFields: any = { fullname, phonenumber, email, profession };

    try {
      // Find the current user from the database
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if avatar is provided in the request body and is different from the current one
      if (avatar && avatar !== user.avatar.url) {
        try {
          // If the current avatar is not the default one, delete it from Cloudinary
          if (
            user.avatar.public_id &&
            user.avatar.public_id !== "default_avatar_id"
          ) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
          }

          // Upload the new avatar to Cloudinary
          const result = await cloudinary.uploader.upload(avatar, {
            folder: "avatars", // Folder where avatars will be stored
            transformation: { width: 300, height: 300, crop: "fill" }, // Resize image to fit 300x300
          });

          // Add new avatar info (public_id and URL) to the updateFields object
          updateFields.avatar = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        } catch (error) {
          return res
            .status(500)
            .json({ message: "Avatar upload failed.", error });
        }
      }

      // Update the user's information in the database
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      return res
        .status(200)
        .json({ message: "User updated successfully.", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: "User update failed.", error });
    }
  }
);


export const DeleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    // Check if userId exists
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }

    // Find user by id and delete
    const user = await userModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }
);


export const ChangeUserPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?._id; // Extract user ID from req.user
    const { avatar, oldpassword, newpassword } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    try {
      const user = await userModel.findById(id).select("+password");;

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Compare old password
      const isMatch = await bcrypt.compare(oldpassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Old Password is Incorrect" });
      }

      const updateFields: any = {};
      if (newpassword) {
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        updateFields.password = hashedPassword;
      }

      if (avatar && avatar !== user.avatar.url) {
        if (
          user.avatar.public_id &&
          user.avatar.public_id !== "default_avatar_id"
        ) {
          console.log("Deleting old avatar from Cloudinary...");
          await cloudinary.uploader.destroy(user.avatar.public_id);
        }
        const result = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          transformation: { width: 300, height: 300, crop: "fill" },
        });
        updateFields.avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      // Update user
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      return res
        .status(200)
        .json({ message: "Password Change successfully.", user: updatedUser });
    } catch (error) {
      console.error("Caught an error:", error);
      return res.status(500).json({ message: "User update failed.", error });
    }
  }
);










