import mongoose, { type Document, Schema } from "mongoose";

// Define withdrawal status
export enum WithdrawalStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

// Interface for withdrawal
export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  amount: number;
  status: WithdrawalStatus;
  accountDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  transactionId?: string;
  transactionDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Withdrawal schema
const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(WithdrawalStatus),
      default: WithdrawalStatus.PENDING,
    },
    accountDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      upiId: { type: String },
    },
    transactionId: { type: String },
    transactionDate: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Withdrawal = mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);

export default Withdrawal;
