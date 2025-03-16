import mongoose, { Schema, Document } from "mongoose";

// Interface for Vet Information
interface IVetInfo {
  name: string;
  clinic: string;
  phone: string;
  address: string;
}

// Interface for individual Pet
interface IPet {
  petName: string;
  petType: string;
  petBreed: string;
  petAge: number;
  // Add additional fields as per your initialPet structure.
}

// Interface for Host Profile specific details
interface IHostProfile {
  profileImage: string;
  bio: string;
  idProof: string;
  facilityPictures: string[];
  petPictures: string[];
  pricingDaycare: string;
  pricingBoarding: string;
  pricingVegMeal: string;
  pricingNonVegMeal: string;
}

// Interface for Payment Details
interface IPaymentDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiid: string;
}

// Main Host Profile Interface
export interface IHostProfileModel extends Document {
  userId: Schema.Types.ObjectId; // Reference to the User as ObjectId
  fullName: string;
  phoneNumber: string;
  email: string;
  pushToken?: string; // Add pushToken field
  age: number;
  gender: string;
  dateOfBirth: Date;
  profession: string;
  location: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  residenceType: string;
  builtUpArea: string;
  petSize: string[]; // Changed to string array
  petGender: string;
  petCount: string;
  willingToWalk: string;
  hasAreaRestrictions: string;
  areaRestrictions: string;
  walkFrequency: string;
  walkDuration: string;
  willingToCook: string;
  cookingOptions: string[];
  groomPet: boolean;
  hasPet: string;
  pets: IPet[];
  hasVetNearby: string;
  vetInfo: IVetInfo;
  hostProfile: IHostProfile;
  paymentDetails: IPaymentDetails;
}

// Schema for Vet Information
const VetInfoSchema = new Schema<IVetInfo>({
  name: { type: String, required: false },
  clinic: { type: String, required: false },
  phone: { type: String, required: false },
  address: { type: String, required: false },
});

// Schema for individual Pet
const PetSchema = new Schema<IPet>({
  petName: { type: String, required: false },
  petType: { type: String, required: false },
  petBreed: { type: String, required: false },
  petAge: { type: Number, required: false },
  // Add other pet-specific fields as per the initialPet state.
});

// Schema for Host Profile specific details
const HostProfileSchema = new Schema<IHostProfile>({
  profileImage: { type: String, required: false },
  bio: { type: String, required: false },
  idProof: { type: String, required: false },
  facilityPictures: { type: [String], default: ["", "", "", ""] },
  petPictures: { type: [String], default: ["", ""] },
  pricingDaycare: { type: String, required: false },
  pricingBoarding: { type: String, required: false },
  pricingVegMeal: { type: String, required: false },
  pricingNonVegMeal: { type: String, required: false },
});

// Schema for Payment Details
const PaymentDetailsSchema = new Schema<IPaymentDetails>({
  accountHolderName: { type: String, required: false },
  accountNumber: { type: String, required: false },
  ifscCode: { type: String, required: false },
  bankName: { type: String, required: false },
  upiid: { type: String, required: false },
});

// Main Host Profile Schema
const ProfileSchema = new Schema<IHostProfileModel>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Properly defined as ObjectId
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  pushToken: { type: String },
  age: { type: Number, required: false },
  gender: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  profession: { type: String, required: false },
  location: { type: String, required: false },
  line1: { type: String, required: false },
  line2: { type: String, required: false },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: false },
  residenceType: { type: String, required: false },
  builtUpArea: { type: String, required: false },
  petSize: { type: [String], required: false }, // Updated to array of strings
  petGender: { type: String, required: false },
  petCount: { type: String, required: false },
  willingToWalk: { type: String, required: false },
  hasAreaRestrictions: { type: String, required: false },
  areaRestrictions: { type: String, required: false },
  walkFrequency: { type: String, required: false },
  walkDuration: { type: String, required: false },
  willingToCook: { type: String, required: false },
  cookingOptions: { type: [String], required: false },
  groomPet: { type: Boolean, required: false },
  hasPet: { type: String, required: false },
  pets: { type: [PetSchema], required: false },
  hasVetNearby: { type: String, required: false },
  vetInfo: { type: VetInfoSchema, required: false },
  hostProfile: { type: HostProfileSchema, required: false },
  paymentDetails: { type: PaymentDetailsSchema, required: false },
});

const HostProfileModel = mongoose.model<IHostProfileModel>(
  "HostProfile",
  ProfileSchema
);

export default HostProfileModel;
