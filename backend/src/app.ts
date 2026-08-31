import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";

// Роуты
import authRoutes from "./routes/authRoutes";
import clientRoutes from "./routes/clientRoutes";
import taskRoutes from "./routes/taskRoutes";
import managerRoutes from "./routes/managerRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import settingRoutes from "./routes/settingRoutes";

const app: Application = express();

// 1. Безопасность HTTP-заголовков
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Защита от брутфорса
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Слишком много попыток входа. Попробуйте позже." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ortera-crm.vercel.app",
  "https://crm.ortera.ru",
  "https://ortera.ru",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".ortera.ru")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. API Маршруты
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/settings", settingRoutes);

// Healthcheck
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 5. Обработка статики и SPA (совместимо с Express 4 и 5)
const clientBuildPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(clientBuildPath));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("API Server is running. Ready for production.");
    }
  });
});

export default app;