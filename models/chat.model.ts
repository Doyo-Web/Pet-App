import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [MessageSchema],
});

export default mongoose.model<IChat>("Chat", ChatSchema);
