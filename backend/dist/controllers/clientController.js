"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.addClientNote = exports.toggleClientActive = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const Client_1 = require("../models/Client");
const Task_1 = require("../models/Task");
const Note_1 = require("../models/Note");
// 1. Получение списка клиентов
const getClients = async (req, res) => {
    try {
        const { type, status, search, isActive, wantsToLearn } = req.query;
        const filter = {};
        const authUser = req.user;
        if (authUser?.role === "manager") {
            filter.manager = authUser.id || authUser._id;
        }
        if (type)
            filter.type = String(type);
        if (status)
            filter.status = String(status);
        if (isActive !== undefined)
            filter.isActive = isActive === "true";
        if (wantsToLearn !== undefined)
            filter.wantsToLearn = wantsToLearn === "true";
        if (search) {
            const searchStr = String(search);
            filter.$or = [
                { name: { $regex: searchStr, $options: "i" } },
                { city: { $regex: searchStr, $options: "i" } },
                { phone: { $regex: searchStr, $options: "i" } },
                { email: { $regex: searchStr, $options: "i" } },
            ];
        }
        const clients = await Client_1.Client.find(filter)
            .populate("manager", "name email phone")
            .sort({ createdAt: -1 });
        const clientsWithCount = await Promise.all(clients.map(async (client) => {
            const tasksCount = await Task_1.Task.countDocuments({
                client: client._id,
                status: { $in: ["in_work", "overdue"] },
            });
            return {
                ...client.toObject(),
                tasksCount,
            };
        }));
        res.json(clientsWithCount);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении списка клиентов", error });
    }
};
exports.getClients = getClients;
// 2. Получение детальной карточки клиента
const getClientById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const client = await Client_1.Client.findById(id).populate("manager", "name email phone");
        if (!client) {
            res.status(404).json({ message: "Клиент не найден" });
            return;
        }
        const [tasks, notes] = await Promise.all([
            Task_1.Task.find({ client: id })
                .populate("manager", "name email phone")
                .sort({ startDate: -1 }),
            Note_1.Note.find({ client: id }).sort({ createdAt: -1 }),
        ]);
        res.json({
            client,
            tasks,
            notes,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении данных клиента", error });
    }
};
exports.getClientById = getClientById;
// 3. Создание клиента с жесткой проверкой дубликатов
const createClient = async (req, res) => {
    try {
        const clientData = req.body;
        const authUser = req.user;
        const cleanPhone = clientData.phone ? clientData.phone.replace(/\D/g, "") : "";
        const cleanEmail = clientData.email ? clientData.email.toLowerCase().trim() : "";
        const cleanInn = clientData.inn ? clientData.inn.trim() : "";
        const duplicateConditions = [];
        if (cleanPhone && cleanPhone.length >= 7) {
            duplicateConditions.push({ phone: { $regex: cleanPhone.slice(-7) } });
        }
        if (cleanEmail && cleanEmail.length > 3) {
            duplicateConditions.push({ email: cleanEmail });
        }
        if (cleanInn) {
            duplicateConditions.push({ inn: cleanInn });
        }
        if (duplicateConditions.length > 0) {
            const existingClient = await Client_1.Client.findOne({ $or: duplicateConditions }).populate("manager", "name");
            if (existingClient) {
                const managerName = existingClient.manager?.name || "другим менеджером";
                res.status(400).json({
                    message: `Клиент «${existingClient.name}» уже зарегистрирован и закреплен за менеджером ${managerName}`,
                });
                return;
            }
        }
        if (authUser?.role === "manager" && !clientData.manager) {
            clientData.manager = authUser.id || authUser._id;
        }
        const client = await Client_1.Client.create(clientData);
        const populated = await Client_1.Client.findById(client._id).populate("manager", "name email phone");
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при создании клиента", error });
    }
};
exports.createClient = createClient;
// 4. Обновление клиента
const updateClient = async (req, res) => {
    try {
        const id = String(req.params.id);
        const updateData = req.body;
        const updated = await Client_1.Client.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate("manager", "name email phone");
        if (!updated) {
            res.status(404).json({ message: "Клиент не найден" });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при обновлении клиента", error });
    }
};
exports.updateClient = updateClient;
// 5. Переключение активности клиента
const toggleClientActive = async (req, res) => {
    try {
        const id = String(req.params.id);
        const client = await Client_1.Client.findById(id);
        if (!client) {
            res.status(404).json({ message: "Клиент не найден" });
            return;
        }
        client.isActive = !client.isActive;
        await client.save();
        res.json(client);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при смене статуса активности", error });
    }
};
exports.toggleClientActive = toggleClientActive;
// 6. Добавление заметки к клиенту
const addClientNote = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { text } = req.body;
        const authUser = req.user;
        if (!text || !text.trim()) {
            res.status(400).json({ message: "Текст заметки не может быть пустым" });
            return;
        }
        const note = await Note_1.Note.create({
            client: id,
            author: authUser?.id || authUser?._id,
            text: text.trim(),
        });
        res.status(201).json(note);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при добавлении заметки", error });
    }
};
exports.addClientNote = addClientNote;
// 7. Удаление клиента
const deleteClient = async (req, res) => {
    try {
        const id = String(req.params.id);
        await Client_1.Client.findByIdAndDelete(id);
        await Task_1.Task.deleteMany({ client: id });
        await Note_1.Note.deleteMany({ client: id });
        res.json({ message: "Клиент и связанные данные удалены" });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при удалении клиента", error });
    }
};
exports.deleteClient = deleteClient;
