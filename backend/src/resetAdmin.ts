import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ Не найден MONGO_URI в .env");
      process.exit(1);
    }

    await mongoose.connect(uri);

    const db = mongoose.connection.db;
    if (!db) throw new Error("База данных не подключена");
    const users = db.collection("users");

    // 1. Создание / обновление Администратора
    const adminEmail = "admin@ortera.ru";
    const adminPassword = "Ortera!Adm#926_Kx8";
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await users.findOne({ role: "admin" });

    if (admin) {
      await users.updateOne(
        { _id: admin._id },
        { $set: { email: adminEmail, password: adminHashedPassword } }
      );
      console.log("✓ Данные администратора успешно обновлены!");
    } else {
      await users.insertOne({
        name: "Администратор",
        email: adminEmail,
        password: adminHashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✓ Новый администратор создан!");
    }

    // 2. Создание / обновление единственного Сетевого Партнёра
    const partnerEmail = "partner@ortera.ru";
    const partnerPassword = "Partner!Ortera#2026";
    const partnerHashedPassword = await bcrypt.hash(partnerPassword, 10);

    const partner = await users.findOne({ role: "partner" });

    if (partner) {
      await users.updateOne(
        { _id: partner._id },
        { $set: { email: partnerEmail, password: partnerHashedPassword } }
      );
      console.log("✓ Данные сетевого партнёра успешно обновлены!");
    } else {
      await users.insertOne({
        name: "Сетевой Партнёр",
        email: partnerEmail,
        password: partnerHashedPassword,
        role: "partner",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✓ Сетевой партнёр создан!");
    }

    console.log("=========================================");
    console.log("Администратор:  ", adminEmail, "/", adminPassword);
    console.log("Сетевой партнёр:", partnerEmail, "/", partnerPassword);
    console.log("=========================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Ошибка:", err);
    process.exit(1);
  }
}

run();