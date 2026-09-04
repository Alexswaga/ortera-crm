import { Request, Response } from "express";
import { ScheduleEvent } from "../models/ScheduleEvent";

// Парсер даты строкового формата "DD.MM.YYYY" с выставлением конца дня (23:59:59)
const parseEventEndDate = (dStr?: string): Date | null => {
  if (!dStr) return null;
  const trimmed = dStr.trim();
  const parts = trimmed.split(".");
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);
    return new Date(year, month, day, 23, 59, 59, 999);
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// 1. Получение событий (с автопереносом в архив по дате)
export const getScheduleEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isArchived } = req.query;

    // Автоматическая проверка и перенос завершившихся активных курсов в архив
    const activeEvents = await ScheduleEvent.find({ isArchived: false });
    const now = new Date();

    for (const event of activeEvents) {
      const dateToCheck = event.endDate || event.startDate;
      const endDateTime = parseEventEndDate(dateToCheck);
      if (endDateTime && endDateTime < now) {
        event.isArchived = true;
        await event.save();
      }
    }

    const filter: Record<string, any> = {};
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === "true";
    }

    const events = await ScheduleEvent.find(filter)
      .populate("students.client", "name activity city phone manager type")
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
    const { title, location, startDate, startTime, endDate, endTime, maxStudents } = req.body;
    const authUser = (req as any).user;

    const event = await ScheduleEvent.create({
      title,
      location,
      startDate,
      startTime: startTime || "",
      endDate,
      endTime: endTime || "",
      maxStudents: maxStudents ? Number(maxStudents) : 10,
      isArchived: false,
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
    const updateData = { ...req.body };
    if (updateData.maxStudents) {
      updateData.maxStudents = Number(updateData.maxStudents);
    }

    const updated = await ScheduleEvent.findByIdAndUpdate(id, updateData, { new: true })
      .populate("students.client", "name activity city phone manager type")
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

// 4. Переключение архива (архивировать / разархивировать)
export const toggleArchiveScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await ScheduleEvent.findById(id);

    if (!event) {
      res.status(404).json({ message: "Событие не найдено" });
      return;
    }

    event.isArchived = !event.isArchived;
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при изменении статуса архива", error });
  }
};

// 5. Добавление ученика/клиента на курс
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
      { path: "students.client", select: "name activity city phone manager type" },
      { path: "students.manager", select: "name" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при добавлении ученика", error });
  }
};

// 6. Изменение статуса оплаты ученика
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
      { path: "students.client", select: "name activity city phone manager type" },
      { path: "students.manager", select: "name" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении статуса оплаты", error });
  }
};

// 7. Удаление ученика из курса
export const removeStudentFromEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, studentId } = req.params;

    const event = await ScheduleEvent.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Событие не найдено" });
      return;
    }

    event.students = event.students.filter(
      (s: any) => s._id.toString() !== studentId && s.client?.toString() !== studentId
    );

    await event.save();

    const populated = await event.populate([
      { path: "students.client", select: "name activity city phone manager type" },
      { path: "students.manager", select: "name" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при удалении ученика с курса", error });
  }
};

// 8. Удаление события
export const deleteScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ScheduleEvent.findByIdAndDelete(id);
    res.json({ message: "Событие удалено" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении события", error });
  }
};