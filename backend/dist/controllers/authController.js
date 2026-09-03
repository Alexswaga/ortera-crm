"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_ortera_2026";
// Вход в систему (логин / email + пароль)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Укажите email и пароль" });
            return;
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            res.status(401).json({ message: "Неверный логин или пароль" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Неверный логин или пароль" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера при входе", error });
    }
};
exports.login = login;
// Регистрация нового пользователя
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(400).json({ message: "Пользователь с таким email уже существует" });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || "manager",
            phone,
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера при регистрации", error });
    }
};
exports.register = register;
// Получение текущего профиля
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Не авторизован" });
            return;
        }
        const user = await User_1.User.findById(req.user.id).select("-password");
        if (!user) {
            res.status(404).json({ message: "Пользователь не найден" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error });
    }
};
exports.getMe = getMe;
