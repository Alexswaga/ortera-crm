import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import clientRoutes from "./routes/clientRoutes";
import taskRoutes from "./routes/taskRoutes";
import managerRoutes from "./routes/managerRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import settingRoutes from "./routes/settingRoutes";

const app = express();

// Разрешаем запросы с локалки и любого клиентского домена (например, на Vercel)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, postman/мобильные клиенты) или входящие в allowedOrigins / *.vercel.app
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(null, true); // Для демо заказчику открываем полный доступ
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API Маршруты
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/settings", settingRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API CRM Ortera работает в штатном режиме" });
});

export default app;