import mongoose, { Document, Schema, Types } from "mongoose";

export interface INote extends Document {
  client: Types.ObjectId;
  author?: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", NoteSchema);