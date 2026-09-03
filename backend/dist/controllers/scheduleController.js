"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScheduleEvent = exports.removeStudentFromEvent = exports.updateStudentPaymentStatus = exports.addStudentToEvent = exports.updateScheduleEvent = exports.createScheduleEvent = exports.getScheduleEvents = void 0;
const ScheduleEvent_1 = require("../models/ScheduleEvent");
// 1. Получение событий графика обучения
const getScheduleEvents = async (req, res) => {
    try {
        const events = await ScheduleEvent_1.ScheduleEvent.find()
            .populate("students.client", "name activity city phone manager")
            .populate("students.manager", "name email phone")
            .sort({ createdAt: -1 });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении графика обучения", error });
    }
};
exports.getScheduleEvents = getScheduleEvents;
// 2. Создание события (доступно и менеджеру, и администратору)
const createScheduleEvent = async (req, res) => {
    try {
        const { title, location, startDate, startTime, endDate, endTime, maxStudents } = req.body;
        const authUser = req.user;
        const event = await ScheduleEvent_1.ScheduleEvent.create({
            title,
            location,
            startDate,
            startTime: startTime || "",
            endDate,
            endTime: endTime || "",
            maxStudents: maxStudents ? Number(maxStudents) : 10,
            manager: authUser?.role === "manager" ? (authUser.id || authUser._id) : undefined,
            students: [],
        });
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при создании события", error });
    }
};
exports.createScheduleEvent = createScheduleEvent;
// 3. Обновление события
const updateScheduleEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (updateData.maxStudents) {
            updateData.maxStudents = Number(updateData.maxStudents);
        }
        const updated = await ScheduleEvent_1.ScheduleEvent.findByIdAndUpdate(id, updateData, { new: true })
            .populate("students.client", "name activity city phone manager")
            .populate("students.manager", "name");
        if (!updated) {
            res.status(404).json({ message: "Событие не найдено" });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при обновлении события", error });
    }
};
exports.updateScheduleEvent = updateScheduleEvent;
// 4. Добавление ученика/клиента на курс
const addStudentToEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, paymentStatus, managerId } = req.body;
        const authUser = req.user;
        const event = await ScheduleEvent_1.ScheduleEvent.findById(id);
        if (!event) {
            res.status(404).json({ message: "Событие не найдено" });
            return;
        }
        event.students.push({
            client: clientId,
            paymentStatus: paymentStatus || "advance",
            manager: managerId || authUser?.id || authUser?._id,
        });
        await event.save();
        const populated = await event.populate([
            { path: "students.client", select: "name activity city phone manager" },
            { path: "students.manager", select: "name" },
        ]);
        res.json(populated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при добавлении ученика", error });
    }
};
exports.addStudentToEvent = addStudentToEvent;
// 5. Изменение статуса оплаты ученика
const updateStudentPaymentStatus = async (req, res) => {
    try {
        const { eventId, studentId } = req.params;
        const { paymentStatus } = req.body;
        const event = await ScheduleEvent_1.ScheduleEvent.findById(eventId);
        if (!event) {
            res.status(404).json({ message: "Событие не найдено" });
            return;
        }
        const student = event.students.id(studentId);
        if (!student) {
            res.status(404).json({ message: "Студент не найден в этом событии" });
            return;
        }
        student.paymentStatus = paymentStatus;
        await event.save();
        const populated = await event.populate([
            { path: "students.client", select: "name activity city phone manager" },
            { path: "students.manager", select: "name" },
        ]);
        res.json(populated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при обновлении статуса оплаты", error });
    }
};
exports.updateStudentPaymentStatus = updateStudentPaymentStatus;
// 6. Удаление ученика из курса (по значку корзины)
const removeStudentFromEvent = async (req, res) => {
    try {
        const { eventId, studentId } = req.params;
        const event = await ScheduleEvent_1.ScheduleEvent.findById(eventId);
        if (!event) {
            res.status(404).json({ message: "Событие не найдено" });
            return;
        }
        event.students = event.students.filter((s) => s._id.toString() !== studentId && s.client?.toString() !== studentId);
        await event.save();
        const populated = await event.populate([
            { path: "students.client", select: "name activity city phone manager" },
            { path: "students.manager", select: "name" },
        ]);
        res.json(populated);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при удалении ученика с курса", error });
    }
};
exports.removeStudentFromEvent = removeStudentFromEvent;
// 7. Удаление события
const deleteScheduleEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await ScheduleEvent_1.ScheduleEvent.findByIdAndDelete(id);
        res.json({ message: "Событие удалено" });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при удалении события", error });
    }
};
exports.deleteScheduleEvent = deleteScheduleEvent;
