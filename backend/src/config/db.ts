import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ortera_crm");
    console.log(`[MongoDB] Подключено: ${conn.connection.host}`);
  } catch (error) {
    console.error("[MongoDB] Ошибка подключения:", error);
    process.exit(1);
  }
};