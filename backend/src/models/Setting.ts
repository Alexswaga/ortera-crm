import mongoose, { Document, Schema } from "mongoose";

export interface ISetting extends Document {
  type: "tag" | "specialty" | "course_type"; // <-- добавлен course_type
  name: string;
  maxStudents?: number; // <-- вместимость для типа курса
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    type: { type: String, enum: ["tag", "specialty", "course_type"], required: true },
    name: { type: String, required: true, trim: true },
    maxStudents: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);