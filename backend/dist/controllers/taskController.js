"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.postponeTask = exports.completeTask = exports.createTask = exports.getTasks = void 0;
const Task_1 = require("../models/Task");
// 1. Получение списка задач с фильтрами и ролевой изоляцией
const getTasks = async (req, res) => {
    try {
        const { status, managerId, clientId } = req.query;
        const filter = {};
        const authUser = req.user;
        if (status) {
            filter.status = status;
        }
        // Если клиент — только его задачи
        if (authUser?.role === "client") {
            filter.client = authUser.id || authUser._id;
        }
        else if (authUser?.role === "manager") {
            // Менеджер видит только свои задачи
            filter.manager = authUser.id || authUser._id;
        }
        else {
            // Администратор может фильтровать по любому менеджеру или клиенту
            if (managerId)
                filter.manager = managerId;
            if (clientId)
                filter.client = clientId;
        }
        const tasks = await Task_1.Task.find(filter)
            .populate("client", "name type activity city phone email")
            .populate("manager", "name email phone")
            .sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении задач", error });
    }
};
exports.getTasks = getTasks;
// 2. Создание новой задачи
const createTask = async (req, res) => {
    try {
        const taskData = req.body;
        const authUser = req.user;
        if (authUser?.role === "manager" && !taskData.manager) {
            taskData.manager = authUser.id || authUser._id;
        }
        if (authUser?.role === "client") {
            taskData.client = authUser.id || authUser._id;
        }
        const task = await Task_1.Task.create(taskData);
        const populated = await Task_1.Task.findById(task._id)
            .populate("client", "name type activity city phone email")
            .populate("manager", "name email phone");
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при создании задачи", error });
    }
};
exports.createTask = createTask;
// 3. Завершение задачи
const completeTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.Task.findByIdAndUpdate(id, { status: "completed" }, { new: true })
            .populate("client", "name type activity city")
            .populate("manager", "name email phone");
        if (!task) {
            res.status(404).json({ message: "Задача не найдена" });
            return;
        }
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при завершении задачи", error });
    }
};
exports.completeTask = completeTask;
// 4. Отложить задачу
const postponeTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { endDate, postponeReason } = req.body;
        const task = await Task_1.Task.findByIdAndUpdate(id, {
            endDate: endDate ? new Date(endDate) : new Date(),
            postponeReason: postponeReason || "",
            status: "in_work"
        }, { new: true })
            .populate("client", "name type activity city")
            .populate("manager", "name email phone");
        if (!task) {
            res.status(404).json({ message: "Задача не найдена" });
            return;
        }
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при переносе задачи", error });
    }
};
exports.postponeTask = postponeTask;
// 5. Удаление задачи
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.Task.findByIdAndDelete(id);
        if (!task) {
            res.status(404).json({ message: "Задача не найдена" });
            return;
        }
        res.json({ message: "Задача успешно удалена", id });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при удалении задачи", error });
    }
};
exports.deleteTask = deleteTask;
