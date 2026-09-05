import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
  oneCId?: string;
  docNumber?: string;
  client: Types.ObjectId;
  amount: number;
  date: Date;
  status: "paid" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    oneCId: { type: String, trim: true },
    docNumber: { type: String, trim: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    amount: { type: Number, required: true, default: 0 },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["paid", "pending"], default: "paid" },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);