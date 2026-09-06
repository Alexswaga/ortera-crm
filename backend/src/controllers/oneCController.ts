import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Client } from "../models/Client";
import { User } from "../models/User";

// Приём пакета документов реализации из 1C:УНФ
export const syncOneCRealization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      docNumber, 
      counterpartyName, 
      inn, 
      insolesCount, 
      amount, 
      date, 
      oneCId, 
      isFromPartnerFolder 
    } = req.body;

    if (!counterpartyName && !inn) {
      res.status(400).json({ message: "Укажите наименование контрагента или ИНН" });
      return;
    }

    // Ищем покупателя в CRM по ИНН или названию
    const searchConditions: any[] = [];
    if (inn && String(inn).trim().length >= 8) {
      searchConditions.push({ inn: String(inn).trim() });
    }
    if (counterpartyName && String(counterpartyName).trim()) {
      searchConditions.push({ name: { $regex: String(counterpartyName).trim(), $options: "i" } });
    }

    let client = await Client.findOne({ $or: searchConditions });

    // Находим сетевого партнёра
    const partnerUser = await User.findOne({ role: "partner" });

    // Если покупателя нет в CRM, но реализация пришла из папки сетевого партнера 1С — создаём сразу в статусе Покупателя
    if (!client) {
      client = await Client.create({
        type: inn ? "company" : "individual",
        name: counterpartyName || `Покупатель ИНН ${inn}`,
        inn: inn || undefined,
        activity: "Подолог / Клиника",
        city: "Город из 1С",
        status: "Покупатель", // Сразу статус Покупатель (была отгрузка)
        partner: isFromPartnerFolder && partnerUser ? partnerUser._id : undefined,
        oneCFolder: isFromPartnerFolder ? "Сетевые партнеры" : "Основные покупатели",
        isSyncedWithOneC: true,
        convertedToBuyerAt: date ? new Date(date) : new Date(),
        messengers: [],
        tags: ["Загружен из 1С"],
      });
    } else {
      // Если клиент был Лидом, в момент первой реализации переводим его в Покупатели
      if (client.status !== "Покупатель") {
        client.status = "Покупатель";
        client.convertedToBuyerAt = new Date();
      }
      if (isFromPartnerFolder && partnerUser && !client.partner) {
        client.partner = partnerUser._id;
        client.oneCFolder = "Сетевые партнеры";
      }
      client.isSyncedWithOneC = true;
      await client.save();
    }

    // Создаём или обновляем запись реализации
    const orderDate = date ? new Date(date) : new Date();
    const cleanInsoles = Number(insolesCount) || 0;
    const cleanAmount = Number(amount) || 0;

    let order = null;
    if (oneCId) {
      order = await Order.findOne({ oneCId });
    }

    if (order) {
      order.docNumber = docNumber || order.docNumber;
      order.counterpartyName = counterpartyName || order.counterpartyName;
      order.insolesCount = cleanInsoles;
      order.amount = cleanAmount;
      order.date = orderDate;
      await order.save();
    } else {
      order = await Order.create({
        oneCId: oneCId || undefined,
        docNumber: docNumber || "Реализация 1С",
        counterpartyName: counterpartyName || client.name,
        client: client._id,
        amount: cleanAmount,
        insolesCount: cleanInsoles,
        date: orderDate,
        status: "paid",
      });
    }

    res.status(200).json({
      message: "Реализация успешно синхронизирована",
      orderId: order._id,
      clientId: client._id,
      clientName: client.name,
      insolesCount: cleanInsoles,
      bonusAccrued: client.partner ? cleanInsoles * 120 : 0,
    });
  } catch (error) {
    console.error("Ошибка приёма реализации из 1C:", error);
    res.status(500).json({ message: "Ошибка обработки документа реализации 1C", error });
  }
};