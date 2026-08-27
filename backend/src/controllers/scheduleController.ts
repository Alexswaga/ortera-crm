import { Request, Response } from "express";
import { ScheduleEvent } from "../models/ScheduleEvent";

// 1. Получение событий графика с ролевой изоляцией
export const getScheduleEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;

    const events = await ScheduleEvent.find()
      .populate("students.client", "name activity city phone manager")
      .populate("students.manager", "name email phone")
      .sort({ createdAt: -1 });

    // Если запрос выполняет менеджер — изолируем события и студентов
    if (authUser?.role === "manager") {
      const managerId = (authUser.id || authUser._id).toString();

      const filteredEvents = events
        .map((event) => {
          const evObj = event.toObject();
          // Оставляем в списке только студентов этого менеджера
          evObj.students = (evObj.students || []).filter((s: any) => {
            const sManagerId = s.manager?._id?.toString() || s.manager?.toString();
            const clientManagerId = s.client?.manager?.toString();
            return sManagerId === managerId || clientManagerId === managerId;
          });
          return evObj;
        })
        // Показываем событие, если оно создано этим менеджером ИЛИ в нем есть его студенты
        .filter((ev) => {
          const evManagerId = ev.manager?._id?.toString() || ev.manager?.toString();
          return evManagerId === managerId || ev.students.length > 0;
        });

      res.json(filteredEvents);
      return;
    }

    // Администратор видит все события и всех студентов
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
      startTime,
      endDate,
      endTime,
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

// 5. Удаление события
export const deleteScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ScheduleEvent.findByIdAndDelete(id);
    res.json({ message: "Событие удалено" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении события", error });
  }
};