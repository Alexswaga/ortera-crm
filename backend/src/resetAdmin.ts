import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ Не найден MONGODB_URI в .env");
      process.exit(1);
    }

    await mongoose.connect(uri);

    // Автоматически подключаем bcrypt или bcryptjs
    let hasher: any;
    try {
      hasher = await import("bcrypt");
    } catch {
      hasher = await import("bcryptjs");
    }
    const bcrypt = hasher.default || hasher;

    const email = "admin@ortera.ru";
    const password = "Ortera!Adm#926_Kx8";
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = mongoose.connection.db;
    if (!db) throw new Error("База данных не подключена");
    const users = db.collection("users");

    const admin = await users.findOne({ role: "admin" });

    if (admin) {
      await users.updateOne(
        { _id: admin._id },
        { $set: { email, password: hashedPassword } }
      );
      console.log("✓ Данные администратора успешно обновлены!");
    } else {
      await users.insertOne({
        name: "Администратор",
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✓ Новый администратор создан!");
    }

    console.log("=========================================");
    console.log("Логин для входа:", email);
    console.log("Пароль для входа:", password);
    console.log("=========================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Ошибка при обновлении пароля:", err);
    process.exit(1);
  }
}

run();