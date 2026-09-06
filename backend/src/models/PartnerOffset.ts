import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPartnerOffset extends Document {
  partner: Types.ObjectId;
  amount: number;
  type: "course" | "goods" | "payout"; // проведение курса | отгрузка товара | прямая выплата
  comment: string;
  date: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerOffsetSchema = new Schema<IPartnerOffset>(
  {
    partner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["course", "goods", "payout"],
      default: "course",
      required: true,
    },
    comment: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const PartnerOffset = mongoose.model<IPartnerOffset>(
  "PartnerOffset",
  PartnerOffsetSchema
);