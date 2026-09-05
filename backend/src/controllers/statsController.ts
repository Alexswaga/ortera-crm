import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Client } from "../models/Client";
import { Task } from "../models/Task";

export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    const { managerId } = req.query;

    let targetManagerId =
      authUser.role === "admin" && managerId
        ? String(managerId)
        : String(authUser.id || authUser._id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Клиенты, привязанные к менеджеру (как текущему или как исходному)
    const clients = await Client.find({
      $or: [{ manager: targetManagerId }, { originalManager: targetManagerId }],
    })
      .populate("manager", "name")
      .populate("originalManager", "name");

    const clientIds = clients.map((c) => c._id);

    // 2. Все оплаченные заказы этих клиентов
    const orders = await Order.find({
      client: { $in: clientIds },
      status: "paid",
    }).sort({ date: -1 });

    let totalSalesMonth = 0;
    let totalSalesYear = 0;
    let totalSalesAll = 0;

    let totalIncomeMonth = 0;
    let totalIncomeYear = 0;
    let totalIncomeAll = 0;

    const breakdownMap: Record<string, any> = {};

    clients.forEach((c) => {
      const origId = (c.originalManager?._id || c.originalManager || "").toString();
      const curId = (c.manager?._id || c.manager || "").toString();

      // Определение процента комиссии:
      // 10% — если клиент его и не передавался
      // 9% — если клиент передан ему от другого
      // 1% — если он передал клиента другому
      let commRate = 0;
      let relationType: "own" | "received" | "transferred" = "own";

      if (origId && curId && origId !== curId) {
        if (targetManagerId === curId) {
          commRate = 9;
          relationType = "received";
        } else if (targetManagerId === origId) {
          commRate = 1;
          relationType = "transferred";
        }
      } else if (targetManagerId === curId) {
        commRate = 10;
        relationType = "own";
      }

      breakdownMap[c._id.toString()] = {
        client: {
          _id: c._id,
          name: c.name,
          city: c.city,
          inn: c.inn,
          activity: c.activity,
          type: c.type,
        },
        commRate,
        relationType,
        salesMonth: 0,
        salesYear: 0,
        salesAll: 0,
        ordersCountYear: 0,
        ordersCountAll: 0,
        earnedMonth: 0,
        earnedYear: 0,
        earnedAll: 0,
      };
    });

    orders.forEach((ord) => {
      const cId = ord.client.toString();
      const item = breakdownMap[cId];
      if (!item) return;

      const ordDate = new Date(ord.date);
      const isMonth = ordDate >= startOfMonth;
      const isYear = ordDate >= startOfYear;
      const earned = (ord.amount * item.commRate) / 100;

      item.salesAll += ord.amount;
      item.ordersCountAll += 1;
      item.earnedAll += earned;

      totalSalesAll += ord.amount;
      totalIncomeAll += earned;

      if (isYear) {
        item.salesYear += ord.amount;
        item.ordersCountYear += 1;
        item.earnedYear += earned;
        totalSalesYear += ord.amount;
        totalIncomeYear += earned;
      }

      if (isMonth) {
        item.salesMonth += ord.amount;
        item.earnedMonth += earned;
        totalSalesMonth += ord.amount;
        totalIncomeMonth += earned;
      }
    });

    // 3. Активность для Администратора
    let adminActivity: any = null;
    if (authUser.role === "admin") {
      const [newLeadsMonth, overdueTasks] = await Promise.all([
        Client.countDocuments({
          manager: targetManagerId,
          status: "Лид",
          createdAt: { $gte: startOfMonth },
        }),
        Task.find({
          manager: targetManagerId,
          status: "overdue",
        }).populate("client", "name phone"),
      ]);

      const currentManagedClients = clients.filter(
        (c) => (c.manager?._id || c.manager || "").toString() === targetManagerId
      );

      const contactedMonth = currentManagedClients.filter(
        (c) => c.lastContactDate && new Date(c.lastContactDate) >= startOfMonth
      );

      const notContactedMonth = currentManagedClients.filter(
        (c) => !c.lastContactDate || new Date(c.lastContactDate) < thirtyDaysAgo
      );

      adminActivity = {
        newLeadsMonth,
        contactedCount: contactedMonth.length,
        contactedClients: contactedMonth.map((c) => ({
          _id: c._id,
          name: c.name,
          lastContactDate: c.lastContactDate,
        })),
        notContactedCount: notContactedMonth.length,
        notContactedClients: notContactedMonth.map((c) => ({
          _id: c._id,
          name: c.name,
          phone: c.phone,
          lastContactDate: c.lastContactDate,
        })),
        overdueTasksCount: overdueTasks.length,
        overdueTasks,
      };
    }

    res.json({
      managerId: targetManagerId,
      summary: {
        totalSalesMonth,
        totalSalesYear,
        totalSalesAll,
        totalIncomeMonth,
        totalIncomeYear,
        totalIncomeAll,
      },
      clientsBreakdown: Object.values(breakdownMap),
      adminActivity,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка расчета статистики", error: err });
  }
};