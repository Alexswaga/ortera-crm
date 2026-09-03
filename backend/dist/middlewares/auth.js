"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Не авторизован: токен отсутствует" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "super_secret_jwt_key_ortera_2026");
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Неверный или истекший токен" });
    }
};
exports.requireAuth = requireAuth;
const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: "Доступ запрещен: недостаточно прав" });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
