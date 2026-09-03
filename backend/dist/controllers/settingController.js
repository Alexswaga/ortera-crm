"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSetting = exports.updateSetting = exports.createSetting = exports.getSettings = void 0;
const Setting_1 = require("../models/Setting");
const Client_1 = require("../models/Client");
// 1. Получение всех настроек (теги / специальности)
const getSettings = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};
        const settings = await Setting_1.Setting.find(filter).sort({ name: 1 });
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при получении настроек", error });
    }
};
exports.getSettings = getSettings;
// 2. Создание настройки
const createSetting = async (req, res) => {
    try {
        const { type, name } = req.body;
        if (!type || !name) {
            res.status(400).json({ message: "Укажите type ('tag' | 'specialty') и name" });
            return;
        }
        const setting = await Setting_1.Setting.create({ type, name: String(name).trim() });
        res.status(201).json(setting);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при создании настройки", error });
    }
};
exports.createSetting = createSetting;
// 3. Обновление настройки
const updateSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const oldSetting = await Setting_1.Setting.findById(id);
        const newName = String(name).trim();
        if (oldSetting && oldSetting.type === "tag" && oldSetting.name !== newName) {
            // Обновляем тег у всех клиентов, у которых он был указан
            await Client_1.Client.updateMany({ tags: oldSetting.name }, { $set: { "tags.$[elem]": newName } }, { arrayFilters: [{ elem: oldSetting.name }] });
        }
        const setting = await Setting_1.Setting.findByIdAndUpdate(id, { name: newName }, { new: true });
        if (!setting) {
            res.status(404).json({ message: "Элемент не найден" });
            return;
        }
        res.json(setting);
    }
    catch (error) {
        res.status(400).json({ message: "Ошибка при обновлении", error });
    }
};
exports.updateSetting = updateSetting;
// 4. Удаление настройки с автоматической очисткой тегов у клиентов
const deleteSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const setting = await Setting_1.Setting.findById(id);
        if (setting) {
            if (setting.type === "tag") {
                // Удаляем этот тег из массива tags у всех клиентов
                await Client_1.Client.updateMany({ tags: setting.name }, { $pull: { tags: setting.name } });
            }
            await Setting_1.Setting.findByIdAndDelete(id);
        }
        res.json({ message: "Элемент удален" });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при удалении", error });
    }
};
exports.deleteSetting = deleteSetting;
