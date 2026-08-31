import { Request, Response } from "express";
import { ScheduleEvent } from "../models/ScheduleEvent";

// 1. Получение событий графика — список дат и событий общий для всех пользователей
export const getScheduleEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await ScheduleEvent.find()
      .populate("students.client", "name activity city phone manager")
      .populate("students.manager", "name email phone")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении графика обучения", error });
  }
};

// 2. Создание события
export const createScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, location, startDate, startTime, endDate, endTime } = req.body;
    const authUser = (req as any).user;

    const event = await ScheduleEvent.create({
      title,
      location,
      startDate,
      startTime: startTime || "",
      endDate,
      endTime: endTime || "",
      manager: authUser?.role === "manager" ? (authUser.id || authUser._id) : undefined,
      students: [],
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании события", error });
  }
};

// 3. Обновление события
export const updateScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await ScheduleEvent.findByIdAndUpdate(id, req.body, { new: true })
      .populate("students.client", "name activity city phone manager")
      .populate("students.manager", "name");

    if (!updated) {
      res.status(404).json({ message: "Событие не найдено" });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении события", error });
  }
};

// 4. Добавление ученика/клиента на курс
export const addStudentToEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { clientId, paymentStatus, managerId } = req.body;
    const authUser = (req as any).user;

    const event = await ScheduleEvent.findById(id);
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
  } catch (error) {
    res.status(400).json({ message: "Ошибка при добавлении ученика", error });
  }
};

// 5. Изменение статуса оплаты ученика в событии
export const updateStudentPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, studentId } = req.params;
    const { paymentStatus } = req.body;

    const event = await ScheduleEvent.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Событие не найдено" });
      return;
    }

    const student = (event.students as any).id(studentId);
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
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении статуса оплаты", error });
  }
};

// 6. Удаление события
export const deleteScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ScheduleEvent.findByIdAndDelete(id);
    res.json({ message: "Событие удалено" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении события", error });
  }
};