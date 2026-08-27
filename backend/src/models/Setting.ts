import mongoose, { Document, Schema } from "mongoose";

export interface ISetting extends Document {
  type: "tag" | "specialty";
  name: string;
}

const SettingSchema = new Schema<ISetting>(
  {
    type: { type: String, enum: ["tag", "specialty"], required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);