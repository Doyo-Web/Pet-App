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
    
      const user = await userModel.create({
        fullname,
        phonenumber,
        email,
        password,
        hearaboutus,
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







