import dotenv from "dotenv";
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const emailRegexPattern: RegExp = /^\S+@\S+\.\S+$/;

dotenv.config();

export interface IUser extends Document {
  fullname: string;
  phonenumber: string;
  email: string;
  password: string;
  hearaboutus: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please enter your fullname"],
    },

    phonenumber: {
      type: String,
      required: [true, "Please enter your phonenumber"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function name(value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be atleast 6 characters"],
      select: false,
    },

    hearaboutus: {
      type: String,
      required: [true, "Please select your hearaboutus"],
    },

    avatar: {
      public_id: String,
      url: String,
    },

    role: {
      type: String,
      default: "pet parents",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
); 

//Hash Password Before Saving
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//Sign Access Token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.ACCESS_TOKEN || "", {
      expiresIn: "5d"
    }
  );
};

//Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN || "",
    {
      expiresIn: "7d",
    }
  );
};

//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
