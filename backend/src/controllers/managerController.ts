import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Client } from "../models/Client";
import { Task } from "../models/Task";

// 1. Получение списка всех менеджеров со статистикой (число клиентов, задач)
export const getManagers = async (req: Request, res: Response): Promise<void> => {
  try {
    const managers = await User.find({ role: { $in: ["manager", "admin"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const managersWithStats = await Promise.all(
      managers.map(async (mgr) => {
        const [clientsCount, activeTasksCount] = await Promise.all([
          Client.countDocuments({ manager: mgr._id }),
          Task.countDocuments({ manager: mgr._id, status: { $in: ["in_work", "overdue"] } }),
        ]);

        return {
          ...mgr.toObject(),
          clientsCount,
          activeTasksCount,
        };
      })
    );

    res.json(managersWithStats);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении списка менеджеров", error });
  }
};

// 2. Детальная информация по менеджеру (с привязанными клиентами и задачами)
export const getManagerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const manager = await User.findById(id).select("-password");

    if (!manager) {
      res.status(404).json({ message: "Менеджер не найден" });
      return;
    }

    const [clients, tasks] = await Promise.all([
      Client.find({ manager: id }).sort({ createdAt: -1 }),
      Task.find({ manager: id }).populate("client", "name type city activity").sort({ endDate: 1 }),
    ]);

    res.json({
      manager,
      clients,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении данных менеджера", error });
  }
};

// 3. Добавление менеджера (только админ)
export const createManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ message: "Пользователь с таким email уже существует" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "123456", salt);

    const newManager = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      role: role || "manager",
    });

    const managerObj = newManager.toObject();
    delete managerObj.password;

    res.status(201).json(managerObj);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании менеджера", error });
  }
};

// 4. Обновление менеджера (с поддержкой нового пароля и активности)
export const updateManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password, isActive } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Если передан новый пароль — хешируем его перед сохранением
    if (password && typeof password === "string" && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password.trim(), salt);
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updated) {
      res.status(404).json({ message: "Менеджер не найден" });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении менеджера", error });
  }
};

// 5. Удаление менеджера
export const deleteManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Менеджер удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении менеджера", error });
  }
};