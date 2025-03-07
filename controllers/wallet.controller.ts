import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Wallet, {
  TransactionType,
  TransactionStatus,
  TransactionSource,
} from "../models/wallet.model";
import Withdrawal, {
  WithdrawalStatus,
  IWithdrawal,
} from "../models/withdrawal.model";
import Host from "../models/hostprofile.model";
import Booking from "../models/booking.model";
import Payment from "../models/payment.model";

// Constants for fee calculations
const PLATFORM_COMMISSION_PERCENTAGE = 20;
const GST_PERCENTAGE = 18;

// Get wallet balance and transactions
export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Find host profile for the user
    const host = await Host.findOne({ userId });

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found",
      });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId, hostId: host._id });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        hostId: host._id,
        balance: 0,
        transactions: [],
        totalEarned: 0,
        totalWithdrawn: 0,
      });
      await wallet.save();
    }

    // Get recent transactions (last 10)
    const recentTransactions = wallet.transactions
      .sort(
        (
          a: { createdAt: { getTime: () => number } },
          b: { createdAt: { getTime: () => number } }
        ) => b.createdAt.getTime() - a.createdAt.getTime()
      )
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all transactions with pagination
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Find host profile for the user
    const host = await Host.findOne({ userId });

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found",
      });
    }

    // Find wallet
    const wallet = await Wallet.findOne({ userId, hostId: host._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    // Get transactions with pagination
    const totalTransactions = wallet.transactions.length;
    const transactions = wallet.transactions
      .sort(
        (
          a: { createdAt: { getTime: () => number } },
          b: { createdAt: { getTime: () => number } }
        ) => b.createdAt.getTime() - a.createdAt.getTime()
      )
      .slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        pages: Math.ceil(totalTransactions / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Process payment and add to wallet
export const processPaymentToWallet = async (
  bookingId: string,
  paymentId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find booking and payment
    const booking = await Booking.findById(bookingId).session(session);
    const payment = await Payment.findById(paymentId).session(session);

    if (!booking || !payment) {
      throw new Error("Booking or payment not found");
    }

    // Find host
    const host = await Host.findOne({userId: booking.selectedHost}).session(
      session
    );

    if (!host) {
      throw new Error("Host not found");
    }

    // Calculate fees
    const totalAmount = payment.amount;
    const platformFee = (totalAmount * PLATFORM_COMMISSION_PERCENTAGE) / 100;
    const gstAmount = (platformFee * GST_PERCENTAGE) / 100;
    const netAmount = totalAmount - platformFee - gstAmount;

    // Find or create wallet
    let wallet = await Wallet.findOne({
      userId: host.userId,
      hostId: host._id,
    }).session(session);

    if (!wallet) {
      wallet = new Wallet({
        userId: host.userId,
        hostId: host._id,
        balance: 0,
        transactions: [],
        totalEarned: 0,
        totalWithdrawn: 0,
      });
    }

    // Create transaction
    const transactionData = {
      amount: totalAmount,
      type: TransactionType.CREDIT,
      status: TransactionStatus.COMPLETED,
      source: TransactionSource.BOOKING_PAYMENT,
      sourceId: payment.orderId,
      description: `Payment received for booking #${booking._id}`,
      bookingId: booking._id,
      paymentId: payment._id,
      platformFee,
      gstAmount,
      netAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add transaction to wallet
    wallet.transactions.push(transactionData as any);
    wallet.balance += netAmount;
    wallet.totalEarned += netAmount;

    // Save wallet
    await wallet.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log(`Added ${netAmount} to wallet for host ${host._id}`);
    return { success: true, transaction: transactionData };
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Error processing payment to wallet:", error);
    throw error;
  }
};

// Request withdrawal
export const requestWithdrawal = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?._id;
    const { amount } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount",
      });
    }

    // Find host profile for the user
    const host = await Host.findOne({ userId }).session(session);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found",
      });
    }

    // Check if host has payment details
    if (
      !host.paymentDetails ||
      !host.paymentDetails.accountHolderName ||
      !host.paymentDetails.accountNumber ||
      !host.paymentDetails.ifscCode ||
      !host.paymentDetails.bankName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please update your payment details before requesting withdrawal",
      });
    }

    // Find wallet
    const wallet = await Wallet.findOne({
      userId,
      hostId: host._id,
    }).session(session);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Create withdrawal request
    const withdrawalData = {
      userId,
      hostId: host._id,
      amount,
      status: WithdrawalStatus.PENDING,
      accountDetails: {
        accountHolderName: host.paymentDetails.accountHolderName,
        accountNumber: host.paymentDetails.accountNumber,
        ifscCode: host.paymentDetails.ifscCode,
        bankName: host.paymentDetails.bankName,
        upiId: host.paymentDetails.upiid,
      },
    };

    const withdrawal = new Withdrawal(withdrawalData);
    await withdrawal.save({ session });

    // Get the ObjectId as string to avoid type issues
    const withdrawalId = (withdrawal._id as mongoose.Types.ObjectId).toString();

    // Create transaction in wallet
    const transactionData = {
      amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.PENDING,
      source: TransactionSource.WITHDRAWAL,
      sourceId: withdrawalId,
      description: `Withdrawal request #${withdrawalId}`,
      withdrawalId: withdrawal._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add transaction to wallet
    wallet.transactions.push(transactionData as any);

    // Deduct amount from wallet balance
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;

    // Save wallet
    await wallet.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Error requesting withdrawal:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to request withdrawal",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get withdrawal history
export const getWithdrawals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Find host profile for the user
    const host = await Host.findOne({ userId });

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host profile not found",
      });
    }

    // Count total withdrawals
    const totalWithdrawals = await Withdrawal.countDocuments({
      userId,
      hostId: host._id,
    });

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find({
      userId,
      hostId: host._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      withdrawals,
      pagination: {
        total: totalWithdrawals,
        page,
        limit,
        pages: Math.ceil(totalWithdrawals / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawals",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
