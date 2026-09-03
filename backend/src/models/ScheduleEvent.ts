import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEventStudent {
  client: Types.ObjectId;
  paymentStatus: "paid" | "advance";
  manager?: Types.ObjectId;
}

export interface IScheduleEvent extends Document {
  title: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  maxStudents: number;
  isArchived: boolean; // <-- Флаг архива
  manager?: Types.ObjectId;
  students: IEventStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleEventSchema = new Schema<IScheduleEvent>(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    startTime: { type: String, default: "" },
    endDate: { type: String, required: true },
    endTime: { type: String, default: "" },
    maxStudents: { type: Number, default: 10 },
    isArchived: { type: Boolean, default: false }, // <-- По умолчанию активный
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