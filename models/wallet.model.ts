import mongoose, { type Document, Schema } from "mongoose";

// Define transaction types
export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

// Define transaction status
export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Define transaction sources
export enum TransactionSource {
  BOOKING_PAYMENT = "BOOKING_PAYMENT",
  WITHDRAWAL = "WITHDRAWAL",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

// Interface for transaction
export interface ITransaction extends Document {
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  source: TransactionSource;
  sourceId?: string;
  description: string;
  bookingId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  withdrawalId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  platformFee?: number;
  gstAmount?: number;
  netAmount?: number;
}

// Interface for wallet
export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  balance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
  totalEarned: number;
  totalWithdrawn: number;
}

// Transaction schema
const TransactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    source: {
      type: String,
      enum: Object.values(TransactionSource),
      required: true,
    },
    sourceId: { type: String },
    description: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    withdrawalId: { type: Schema.Types.ObjectId, ref: "Withdrawal" },
    platformFee: { type: Number },
    gstAmount: { type: Number },
    netAmount: { type: Number },
  },
  { timestamps: true }
);

// Wallet schema
const WalletSchema = new Schema<IWallet>(
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
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [TransactionSchema],
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create a compound index on userId and hostId to ensure uniqueness
WalletSchema.index({ userId: 1, hostId: 1 }, { unique: true });

const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
