import { Request, Response } from "express";
import { Client } from "../models/Client";
import { Task } from "../models/Task";
import { Note } from "../models/Note";

// 1. Получение списка клиентов
export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, search, isActive, wantsToLearn, partnerId } = req.query;
    const filter: Record<string, any> = {};
    const authUser = (req as any).user;

    if (authUser?.role === "manager") {
      filter.manager = authUser.id || authUser._id;
    } else if (authUser?.role === "partner") {
      // Сетевой партнёр видит только покупателей, которых он привёл
      filter.partner = authUser.id || authUser._id;
    }

    if (type) filter.type = String(type);
    if (status) filter.status = String(status);
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (wantsToLearn !== undefined) filter.wantsToLearn = wantsToLearn === "true";
    if (partnerId) filter.partner = String(partnerId);

    if (search) {
      const searchStr = String(search);
      filter.$or = [
        { name: { $regex: searchStr, $options: "i" } },
        { city: { $regex: searchStr, $options: "i" } },
        { phone: { $regex: searchStr, $options: "i" } },
        { email: { $regex: searchStr, $options: "i" } },
      ];
    }

    const clients = await Client.find(filter)
      .populate("manager", "name email phone")
      .populate("originalManager", "name email phone")
      .populate("partner", "name email phone")
      .sort({ createdAt: -1 });

    const clientsWithCount = await Promise.all(
      clients.map(async (client: any) => {
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

// 2. Получение детальной карточки
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const client = await Client.findById(id)
      .populate("manager", "name email phone")
      .populate("originalManager", "name email phone")
      .populate("partner", "name email phone");

    if (!client) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    const [tasks, notes] = await Promise.all([
      Task.find({ client: id as any })
        .populate("manager", "name email phone")
        .sort({ startDate: -1 }),
      Note.find({ client: id as any }).sort({ createdAt: -1 }),
    ]);

    res.json({ client, tasks, notes });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении данных клиента", error });
  }
};

// 3. Создание (Лид или сразу Покупатель)
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientData = req.body;
    const authUser = (req as any).user;

    const cleanPhone = clientData.phone ? clientData.phone.replace(/\D/g, "") : "";
    const cleanEmail = clientData.email ? clientData.email.toLowerCase().trim() : "";
    const cleanInn = clientData.inn ? clientData.inn.trim() : "";

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

    if (!clientData.originalManager) {
      clientData.originalManager = clientData.manager || (authUser?.id || authUser?._id);
    }

    // Если сразу создается как Покупатель — фиксируем дату конвертации
    if (clientData.status === "Покупатель") {
      clientData.convertedToBuyerAt = new Date();
      clientData.oneCFolder = clientData.partner ? "Сетевые партнеры" : "Основные покупатели";
    }

    const client = await Client.create(clientData);
    const populated = await Client.findById(client._id)
      .populate("manager", "name email phone")
      .populate("originalManager", "name email phone")
      .populate("partner", "name email phone");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании клиента", error });
  }
};

// 4. Обновление
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const updateData = req.body;

    if (updateData.partner) {
      updateData.oneCFolder = "Сетевые партнеры";
    }

    const updated = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate("manager", "name email phone")
      .populate("originalManager", "name email phone")
      .populate("partner", "name email phone");

    if (!updated) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении клиента", error });
  }
};

// 5. Переход Лида в Покупателя (Момент первой реализации)
export const convertToBuyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const client = await Client.findById(id);

    if (!client) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    client.status = "Покупатель";
    client.convertedToBuyerAt = new Date();
    client.oneCFolder = client.partner ? "Сетевые партнеры" : "Основные покупатели";
    client.isSyncedWithOneC = true; // Готов к приёму накладных из 1С

    await client.save();

    const populated = await Client.findById(id)
      .populate("manager", "name email phone")
      .populate("originalManager", "name email phone")
      .populate("partner", "name email phone");

    res.json({
      message: "Клиент успешно переведён в статус Покупателя и готов к обмену с 1С",
      client: populated,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при конвертации Лида в Покупателя", error });
  }
};

// 6. Переключение активности
export const toggleClientActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
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

// 7. Добавление заметки
export const addClientNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { text } = req.body;
    const authUser = (req as any).user;

    if (!text || !text.trim()) {
      res.status(400).json({ message: "Текст заметки не может быть пустым" });
      return;
    }

    const note = await Note.create({
      client: id as any,
      author: authUser?.id || authUser?._id,
      text: text.trim(),
    });

    await Client.findByIdAndUpdate(id, { lastContactDate: new Date() });

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при добавлении заметки", error });
  }
};

// 8. Передача другому менеджеру
export const transferClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { newManagerId } = req.body;

    if (!newManagerId) {
      res.status(400).json({ message: "Не указан ID нового менеджера" });
      return;
    }

    const currentClient = await Client.findById(id);
    if (!currentClient) {
      res.status(404).json({ message: "Клиент не найден" });
      return;
    }

    const originalManagerId = currentClient.originalManager || currentClient.manager;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { 
        $set: { 
          manager: newManagerId,
          originalManager: originalManagerId,
          lastContactDate: new Date()
        } 
      },
      { new: true }
    )
      .populate("manager", "name email phone")
      .populate("originalManager", "name email phone")
      .populate("partner", "name email phone");

    await Task.updateMany(
      { client: id as any, status: { $in: ["in_work", "overdue"] } },
      { $set: { manager: newManagerId } }
    );

    res.json({
      message: "Клиент успешно передан новому менеджеру",
      client: updatedClient,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при передаче клиента", error });
  }
};

// 9. Удаление
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await Client.findByIdAndDelete(id);
    await Task.deleteMany({ client: id as any });
    await Note.deleteMany({ client: id as any });

    res.json({ message: "Клиент и связанные данные удалены" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении клиента", error });
  }
};