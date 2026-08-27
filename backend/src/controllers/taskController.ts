import { Request, Response } from "express";
import { Task } from "../models/Task";

// 1. Получение списка задач с фильтрами и ролевой изоляцией
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, managerId, clientId } = req.query;
    const filter: any = {};
    const authUser = (req as any).user;

    if (status) {
      filter.status = status;
    }

    // Если клиент — только его задачи
    if (authUser?.role === "client") {
      filter.client = authUser.id || authUser._id;
    } else if (authUser?.role === "manager") {
      // Менеджер видит только свои задачи
      filter.manager = authUser.id || authUser._id;
    } else {
      // Администратор может фильтровать по любому менеджеру или клиенту
      if (managerId) filter.manager = managerId;
      if (clientId) filter.client = clientId;
    }

    const tasks = await Task.find(filter)
      .populate("client", "name type activity city phone email")
      .populate("manager", "name email phone")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении задач", error });
  }
};

// 2. Создание новой задачи
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData = req.body;
    const authUser = (req as any).user;

    if (authUser?.role === "manager" && !taskData.manager) {
      taskData.manager = authUser.id || authUser._id;
    }

    if (authUser?.role === "client") {
      taskData.client = authUser.id || authUser._id;
    }

    const task = await Task.create(taskData);
    const populated = await Task.findById(task._id)
      .populate("client", "name type activity city phone email")
      .populate("manager", "name email phone");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании задачи", error });
  }
};

// 3. Завершение задачи
export const completeTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    )
      .populate("client", "name type activity city")
      .populate("manager", "name email phone");

    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при завершении задачи", error });
  }
};

// 4. Отложить задачу
export const postponeTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { endDate, postponeReason } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { 
        endDate: endDate ? new Date(endDate) : new Date(), 
        postponeReason: postponeReason || "", 
        status: "in_work" 
      },
      { new: true }
    )
      .populate("client", "name type activity city")
      .populate("manager", "name email phone");

    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при переносе задачи", error });
  }
};

// 5. Удаление задачи
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }

    res.json({ message: "Задача успешно удалена", id });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении задачи", error });
  }
};