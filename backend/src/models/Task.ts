import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  client: Types.ObjectId;
  manager?: Types.ObjectId;
  type: string; // "Звонок" | "Встреча" | "Отправить КП" | "Оплата"
  startDate: Date;
  endDate: Date;
  status: "in_work" | "overdue" | "completed" | "archive";
  hasLightning?: boolean;
  postponeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, default: "Звонок" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["in_work", "overdue", "completed", "archive"], 
      default: "in_work" 
    },
    hasLightning: { type: Boolean, default: false },
    postponeReason: { type: String },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>("Task", TaskSchema);