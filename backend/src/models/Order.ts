import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
  oneCId?: string;           // Идентификатор документа в 1C (Ref_Key)
  docNumber?: string;        // Номер документа реализации в 1С
  counterpartyName?: string; // Название Контрагента из 1С
  client: Types.ObjectId;    // Ссылка на покупателя в CRM
  amount: number;            // Сумма реализации (если передана)
  insolesCount: number;      // Число проданных стелек в реализации
  date: Date;                // Дата реализации в 1С
  status: "paid" | "pending";
  isTrial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    oneCId: { type: String, trim: true },
    docNumber: { type: String, trim: true },
    counterpartyName: { type: String, trim: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    amount: { type: Number, required: true, default: 0 },
    insolesCount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["paid", "pending"], default: "paid" },
    isTrial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);