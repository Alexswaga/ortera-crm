import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: "admin" | "manager" | "client";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "manager", "client"], 
      default: "manager" 
    },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);