import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessenger {
  messenger: string; // "Телеграм" | "WhatsApp" | "МАКС" | "ВКонтакте"
  type: string;      // "Ссылка" | "Номер телефона" | "Юзернейм"
  url: string;
}

export interface IEmployee {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  messenger?: string;
}

export interface IClient extends Document {
  type: "individual" | "company";
  name: string;
  inn?: string;
  activity: string;
  city: string;
  email?: string;
  phone?: string;
  messengers: IMessenger[];
  manager?: Types.ObjectId;
  status: "Лид" | "Покупатель";
  isActive: boolean;
  isCeased: boolean;
  wantsToLearn: boolean; // <-- Чекбокс «Желающий обучаться»
  tags: string[];
  employees: IEmployee[];
  lastContactDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    type: { type: String, enum: ["individual", "company"], required: true },
    name: { type: String, required: true, trim: true },
    inn: { type: String, trim: true },
    activity: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    messengers: [
      {
        messenger: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Лид", "Покупатель"], default: "Лид" },
    isActive: { type: Boolean, default: true },
    isCeased: { type: Boolean, default: false },
    wantsToLearn: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    employees: [
      {
        name: { type: String, required: true },
        role: { type: String },
        phone: { type: String },
        email: { type: String },
        messenger: { type: String },
      },
    ],
    lastContactDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>("Client", ClientSchema);