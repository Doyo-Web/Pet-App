import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  _id?: string;
  sender: mongoose.Types.ObjectId | string;
  content: string;
  contentType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  timestamp: Date;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastMessage: IMessage;
}

const MessageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  contentType: {
    type: String,
    enum: ["text", "image", "video", "audio"],
    default: "text",
  },
  mediaUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema: Schema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [MessageSchema],
    lastMessage: MessageSchema,
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
