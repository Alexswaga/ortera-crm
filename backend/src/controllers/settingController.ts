import { Request, Response } from "express";
import { Setting } from "../models/Setting";
import { Client } from "../models/Client";

// 1. Получение всех настроек (теги / специальности)
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

    const oldSetting = await Setting.findById(id);
    const newName = String(name).trim();

    if (oldSetting && oldSetting.type === "tag" && oldSetting.name !== newName) {
      // Обновляем тег у всех клиентов, у которых он был указан
      await Client.updateMany(
        { tags: oldSetting.name },
        { $set: { "tags.$[elem]": newName } },
        { arrayFilters: [{ elem: oldSetting.name }] }
      );
    }

    const setting = await Setting.findByIdAndUpdate(
      id,
      { name: newName },
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

// 4. Удаление настройки с автоматической очисткой тегов у клиентов
export const deleteSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const setting = await Setting.findById(id);

    if (setting) {
      if (setting.type === "tag") {
        // Удаляем этот тег из массива tags у всех клиентов
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