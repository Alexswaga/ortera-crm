import { Request, Response } from "express";
import { Client } from "../models/Client";
import { Task } from "../models/Task";
import { Note } from "../models/Note";

// 1. Получение списка клиентов
export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, search, isActive } = req.query;
    const filter: any = {};
    const authUser = (req as any).user;

    if (authUser?.role === "manager") {
      filter.manager = authUser.id || authUser._id;
    }

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(filter)
      .populate("manager", "name email phone")
      .sort({ createdAt: -1 });

    const clientsWithCount = await Promise.all(
      clients.map(async (client) => {
        const tasksCount = await Task.countDocuments({
          client: client._id,
          status: { $in: ["in_work", "overdue"] },
        });
        return {
          ...client.toObject(),
          tasksCount,
        };
      })
    );

    res.json(clientsWithCount);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении списка клиентов", error });
  }
};

// 2. Получение детальной карточки клиента
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id).populate("manager", "name email phone");
    if (!client) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    const [tasks, notes] = await Promise.all([
      Task.find({ client: id })
        .populate("manager", "name email phone")
        .sort({ startDate: -1 }),
      Note.find({ client: id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      client,
      tasks,
      notes,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении данных клиента", error });
  }
};

// 3. Создание клиента с жесткой проверкой дубликатов
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientData = req.body;
    const authUser = (req as any).user;

    const cleanPhone = clientData.phone ? clientData.phone.replace(/\D/g, "") : "";
    const cleanEmail = clientData.email ? clientData.email.toLowerCase().trim() : "";
    const cleanInn = clientData.inn ? clientData.inn.trim() : "";

    // Поиск совпадений по телефону, email или ИНН
    const duplicateConditions: any[] = [];
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
      const existingClient = await Client.findOne({ $or: duplicateConditions }).populate("manager", "name");
      if (existingClient) {
        const managerName = (existingClient.manager as any)?.name || "другим менеджером";
        res.status(400).json({
          message: `Клиент «${existingClient.name}» уже зарегистрирован и закреплен за менеджером ${managerName}`,
        });
        return;
      }
    }

    if (authUser?.role === "manager" && !clientData.manager) {
      clientData.manager = authUser.id || authUser._id;
    }

    const client = await Client.create(clientData);
    const populated = await Client.findById(client._id).populate("manager", "name email phone");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании клиента", error });
  }
};

// 4. Обновление клиента
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("manager", "name email phone");

    if (!updated) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении клиента", error });
  }
};

// 5. Переключение активности клиента
export const toggleClientActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);

    if (!client) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    client.isActive = !client.isActive;
    await client.save();

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при смене статуса активности", error });
  }
};

// 6. Добавление заметки к клиенту
export const addClientNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const authUser = (req as any).user;

    if (!text || !text.trim()) {
      res.status(400).json({ message: "Текст заметки не может быть пустым" });
      return;
    }

    const note = await Note.create({
      client: id,
      author: authUser?.id || authUser?._id,
      text: text.trim(),
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при добавлении заметки", error });
  }
};

// 7. Удаление клиента
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Client.findByIdAndDelete(id);
    await Task.deleteMany({ client: id });
    await Note.deleteMany({ client: id });

    res.json({ message: "Клиент и связанные данные удалены" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении клиента", error });
  }
};