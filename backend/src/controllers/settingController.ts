import { Request, Response } from "express";
import { Setting } from "../models/Setting";

// 1. Получение всех настроек (разделенных на tags и specialties)
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    const filter: any = type ? { type } : {};
    const settings = await Setting.find(filter).sort({ name: 1 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении настроек", error });
  }
};

// 2. Создание настройки (тег или специальность)
export const createSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, name } = req.body;
    if (!type || !name) {
      res.status(400).json({ message: "Укажите type ('tag' | 'specialty') и name" });
      return;
    }

    const setting = await Setting.create({ type, name: String(name).trim() });
    res.status(201).json(setting);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании настройки", error });
  }
};

// 3. Обновление настройки
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const setting = await Setting.findByIdAndUpdate(
      id,
      { name: String(name).trim() },
      { new: true }
    );

    if (!setting) {
      res.status(404).json({ message: "Элемент не найден" });
      return;
    }

    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при обновлении", error });
  }
};

// 4. Удаление настройки
export const deleteSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Setting.findByIdAndDelete(id);
    res.json({ message: "Элемент удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении", error });
  }
};