import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

interface IChat extends Document {
  booking: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  isActive: boolean;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [MessageSchema],
  isActive: { type: Boolean, default: true },
});

export default mongoose.model<IChat>("Chat", ChatSchema);
