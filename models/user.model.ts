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
  pushToken?: string;
  hearaboutus: string;
  avatar: {
    public_id: string;
    url: string;
  };
  aadhar: {
    public_id: string;
    url: string;
    number: string;
  };
  role: string;
  profession: string;
  address: {
    pickuplocation: string;
    useraddress: string;
    city: string;
    pincode: string;
  };
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
      public_id: {
        type: String,
        default: "default_avatar_id", // Placeholder public ID
      },
      url: {
        type: String,
        default:
          "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=", // Placeholder URL
      },
    },

    aadhar: {
      public_id: {
        type: String,
        default: "default_avatar_id", // Placeholder public ID
      },
      url: {
        type: String,
        default: "https://i.sstatic.net/y9DpT.jpg", // Placeholder URL
      },

      number: { type: String },
    },

    role: {
      type: String,
      default: "pet parents",
    },

    profession: {
      type: String,
      default: "Freelancer",
    },

    address: {
      pickuplocation: {
        type: String,
        // required: [true, "Please enter your pickup location"],
      },

      useraddress: {
        type: String,
        // required: [true, "Please enter your address"],
      },

      city: {
        type: String,
        // required: [true, "Please enter your city"],
      },

      pincode: {
        type: String,
        // required: [true, "Please enter your pincode"],
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    pushToken: {
      type: String,
      required: false, // Optional field
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
      expiresIn: "10d"
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
