"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Роуты
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const app = (0, express_1.default)();
// 1. Безопасность HTTP-заголовков
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
// 2. Защита от брутфорса
const loginLimiter = (0, express_rate_limit_1.default)({
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            origin.endsWith(".ortera.ru")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// 4. API Маршруты
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/clients", clientRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
app.use("/api/managers", managerRoutes_1.default);
app.use("/api/schedule", scheduleRoutes_1.default);
app.use("/api/settings", settingRoutes_1.default);
// Healthcheck
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// 5. Обработка статики и SPA (совместимо с Express 4 и 5)
const clientBuildPath = path_1.default.join(__dirname, "../../frontend/dist");
app.use(express_1.default.static(clientBuildPath));
app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }
    res.sendFile(path_1.default.join(clientBuildPath, "index.html"), (err) => {
        if (err) {
            res.status(200).send("API Server is running. Ready for production.");
        }
    });
});
exports.default = app;
