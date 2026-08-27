import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEventStudent {
  client: Types.ObjectId;
  paymentStatus: "paid" | "advance";
  manager?: Types.ObjectId;
}

export interface IScheduleEvent extends Document {
  title: string;
  location: string;
  startDate: string; // "10.08.2026"
  startTime: string; // "10:00"
  endDate: string;   // "11.08.2026"
  endTime: string;   // "12:00"
  manager?: Types.ObjectId; // Менеджер-автор события
  students: IEventStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleEventSchema = new Schema<IScheduleEvent>(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endDate: { type: String, required: true },
    endTime: { type: String, required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    students: [
      {
        client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
        paymentStatus: { type: String, enum: ["paid", "advance"], default: "advance" },
        manager: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export const ScheduleEvent = mongoose.model<IScheduleEvent>("ScheduleEvent", ScheduleEventSchema);