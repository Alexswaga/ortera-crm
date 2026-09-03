import { Request, Response } from "express";
import { Setting } from "../models/Setting";
import { Client } from "../models/Client";

// 1. Получение всех настроек
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

// 2. Создание настройки
export const createSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, name, maxStudents } = req.body;
    if (!type || !name) {
      res.status(400).json({ message: "Укажите type и name" });
      return;
    }

    const setting = await Setting.create({
      type,
      name: String(name).trim(),
      maxStudents: maxStudents ? Number(maxStudents) : 10,
    });
    res.status(201).json(setting);
  } catch (error) {
    res.status(400).json({ message: "Ошибка при создании настройки", error });
  }
};

// 3. Обновление настройки
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, maxStudents } = req.body;

    const oldSetting = await Setting.findById(id);
    const newName = name ? String(name).trim() : oldSetting?.name;

    if (oldSetting && oldSetting.type === "tag" && newName && oldSetting.name !== newName) {
      await Client.updateMany(
        { tags: oldSetting.name },
        { $set: { "tags.$[elem]": newName } },
        { arrayFilters: [{ elem: oldSetting.name }] }
      );
    }

    const updateData: any = {};
    if (newName) updateData.name = newName;
    if (maxStudents !== undefined) updateData.maxStudents = Number(maxStudents);

    const setting = await Setting.findByIdAndUpdate(id, updateData, { new: true });

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
    const setting = await Setting.findById(id);

    if (setting) {
      if (setting.type === "tag") {
        await Client.updateMany(
          { tags: setting.name },
          { $pull: { tags: setting.name } }
        );
      }
      await Setting.findByIdAndDelete(id);
    }

    res.json({ message: "Элемент удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении", error });
  }
};