"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManager = exports.updateManager = exports.createManager = exports.getManagerById = exports.getManagers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Client_1 = require("../models/Client");
const Task_1 = require("../models/Task");
// 1. Получение списка всех менеджеров со статистикой (число клиентов, задач)
const getManagers = async (req, res) => {
    try {
        const managers = await User_1.User.find({ role: { $in: ["manager", "admin"] } })
            .select("-password")
            .sort({ createdAt: -1 });
        const managersWithStats = await Promise.all(managers.map(async (mgr) => {
            const [clientsCount, activeTasksCount] = await Promise.all([
                Client_1.Client.countDocuments({ manager: mgr._id }),
                Task_1.Task.countDocuments({ manager: mgr._id, status: { $in: ["in_work", "overdue"] } }),
            ]);
            return {
                ...mgr.toObject(),
                clientsCount,
                activeTasksCount,
            };
        }));
        res.json(managersWithStats);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении списка менеджеров", error });
    }
};
exports.getManagers = getManagers;
// 2. Детальная информация по менеджеру (с привязанными клиентами и задачами)
const getManagerById = async (req, res) => {
    try {
        const { id } = req.params;
        const manager = await User_1.User.findById(id).select("-password");
        if (!manager) {
            res.status(404).json({ message: "Менеджер не найден" });
            return;
        }
        const [clients, tasks] = await Promise.all([
            Client_1.Client.find({ manager: id }).sort({ createdAt: -1 }),
            Task_1.Task.find({ manager: id }).populate("client", "name type city activity").sort({ endDate: 1 }),
        ]);
        res.json({
            manager,
            clients,
            tasks,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении данных менеджера", error });
    }
};
exports.getManagerById = getManagerById;
// 3. Добавление менеджера (только админ)
const createManager = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(400).json({ message: "Пользователь с таким email уже существует" });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password || "123456", salt);
        const newManager = await User_1.User.create({
            name,
            email: email.toLowerCase().trim(),
            phone,
            password: hashedPassword,
            role: role || "manager",
        });
        const managerObj = newManager.toObject();
        delete managerObj.password;
        res.status(201).json(managerObj);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при создании менеджера", error });
    }
};
exports.createManager = createManager;
// 4. Обновление менеджера (с поддержкой нового пароля и активности)
const updateManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, password, isActive } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email.toLowerCase().trim();
        if (phone !== undefined)
            updateData.phone = phone;
        if (role !== undefined)
            updateData.role = role;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        // Если передан новый пароль — хешируем его перед сохранением
        if (password && typeof password === "string" && password.trim().length > 0) {
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(password.trim(), salt);
        }
        const updated = await User_1.User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select("-password");
        if (!updated) {
            res.status(404).json({ message: "Менеджер не найден" });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при обновлении менеджера", error });
    }
};
exports.updateManager = updateManager;
// 5. Удаление менеджера
const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;
        await User_1.User.findByIdAndDelete(id);
        res.json({ message: "Менеджер удален" });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при удалении менеджера", error });
    }
};
exports.deleteManager = deleteManager;
