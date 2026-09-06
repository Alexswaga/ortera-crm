import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Client } from "../models/Client";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { PartnerOffset } from "../models/PartnerOffset";

const PARTNER_INSOLE_RATE = 120; // 120 рублей с каждой проданной стельки

export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    const { managerId, partnerId } = req.query;

    const now = new Date();
    const currentYearNum = now.getFullYear();
    const startOfMonth = new Date(currentYearNum, now.getMonth(), 1);
    const startOfYear = new Date(currentYearNum, 0, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // ================= 1. СПЕЦИАЛЬНЫЙ РЕЖИМ ДЛЯ СЕТЕВОГО ПАРТНЁРА =================
    if (authUser.role === "partner" || partnerId) {
      let targetPartnerId = authUser.role === "partner"
        ? String(authUser.id || authUser._id)
        : String(partnerId);

      // Если админ не указал partnerId, находим единственного партнёра автоматически
      if (!targetPartnerId || targetPartnerId === "undefined") {
        const singlePartner = await User.findOne({ role: "partner" });
        if (singlePartner) targetPartnerId = singlePartner._id.toString();
      }

      // Находим покупателей сетевого партнёра
      const partnerClients = await Client.find({
        partner: targetPartnerId,
        status: "Покупатель",
      }).populate("manager", "name email phone");

      const pClientIds = partnerClients.map((c) => c._id);

      // Заказы покупателей
      const partnerOrders = await Order.find({
        client: { $in: pClientIds },
        status: "paid",
      })
        .populate("client", "name city inn activity")
        .sort({ date: -1 });

      let totalInsolesMonth = 0;
      let totalInsolesYear = 0;
      let totalInsolesAll = 0;

      let totalSalesMonth = 0;
      let totalSalesYear = 0;
      let totalSalesAll = 0;

      partnerOrders.forEach((o) => {
        const insoles = o.insolesCount || 0;
        const d = new Date(o.date);
        const isMonth = d >= startOfMonth;
        const isYear = d >= startOfYear;

        totalSalesAll += o.amount;
        totalInsolesAll += insoles;

        if (isYear) {
          totalSalesYear += o.amount;
          totalInsolesYear += insoles;
        }
        if (isMonth) {
          totalSalesMonth += o.amount;
          totalInsolesMonth += insoles;
        }
      });

      // Начисленные бонусы (стельки * 120 ₽)
      const bonusAccruedMonth = totalInsolesMonth * PARTNER_INSOLE_RATE;
      const bonusAccruedYear = totalInsolesYear * PARTNER_INSOLE_RATE;
      const bonusAccruedAll = totalInsolesAll * PARTNER_INSOLE_RATE;

      // Получаем все взаимозачёты партнёра
      const offsets = await PartnerOffset.find({ partner: targetPartnerId }).sort({ date: -1 });

      let totalOffsetMonth = 0;
      let totalOffsetYear = 0;
      let totalOffsetAll = 0;

      offsets.forEach((off) => {
        const d = new Date(off.date);
        totalOffsetAll += off.amount;
        if (d >= startOfYear) totalOffsetYear += off.amount;
        if (d >= startOfMonth) totalOffsetMonth += off.amount;
      });

      // Итоговый текущий баланс долга компании перед партнёром
      const balanceDebt = bonusAccruedAll - totalOffsetAll;

      // Группировка покупателей
      const clientsSummaryMap: Record<string, any> = {};

      partnerClients.forEach((c) => {
        clientsSummaryMap[c._id.toString()] = {
          client: c,
          totalAmount: 0,
          totalInsoles: 0,
          ordersCount: 0,
          bonusTotal: 0,
          orders: [],
        };
      });

      partnerOrders.forEach((ord) => {
        const cId = (ord.client as any)?._id?.toString() || ord.client?.toString();
        if (clientsSummaryMap[cId]) {
          const insoles = ord.insolesCount || 0;
          clientsSummaryMap[cId].totalAmount += ord.amount;
          clientsSummaryMap[cId].totalInsoles += insoles;
          clientsSummaryMap[cId].bonusTotal += insoles * PARTNER_INSOLE_RATE;
          clientsSummaryMap[cId].ordersCount += 1;
          clientsSummaryMap[cId].orders.push({
            _id: ord._id,
            docNumber: ord.docNumber || "—",
            date: ord.date,
            amount: ord.amount,
            insolesCount: insoles,
            bonus: insoles * PARTNER_INSOLE_RATE,
          });
        }
      });

      res.json({
        isPartnerView: true,
        partnerId: targetPartnerId,
        ratePerInsole: PARTNER_INSOLE_RATE,
        summary: {
          totalInsolesMonth,
          totalInsolesYear,
          totalInsolesAll,
          bonusAccruedMonth,
          bonusAccruedYear,
          bonusAccruedAll,
          totalOffsetMonth,
          totalOffsetYear,
          totalOffsetAll,
          balanceDebt, // текущий остаток долга
          totalSalesMonth,
          totalSalesYear,
          totalSalesAll,
          clientsCount: partnerClients.length,
          ordersCount: partnerOrders.length,
        },
        clients: Object.values(clientsSummaryMap),
        offsets,
        allOrders: partnerOrders,
      });
      return;
    }

    // ================= 2. СТАНДАРТНЫЙ РЕЖИМ ДЛЯ АДМИНА И МЕНЕДЖЕРОВ =================
    let targetManagerId =
      authUser.role === "admin" && managerId
        ? String(managerId)
        : String(authUser.id || authUser._id);

    const clients = await Client.find({
      $or: [{ manager: targetManagerId }, { originalManager: targetManagerId }],
    })
      .populate("manager", "name")
      .populate("originalManager", "name")
      .populate("partner", "name");

    const clientIds = clients.map((c) => c._id);

    const orders = await Order.find({
      client: { $in: clientIds },
      status: "paid",
    }).sort({ date: 1 });

    let totalSalesMonth = 0;
    let totalSalesYear = 0;
    let totalSalesAll = 0;

    let totalIncomeMonth = 0;
    let totalIncomeYear = 0;
    let totalIncomeAll = 0;

    const monthlyGraph = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      sales: 0,
      income: 0,
      ordersCount: 0,
    }));

    const breakdownMap: Record<string, any> = {};

    clients.forEach((c) => {
      const origId = (c.originalManager?._id || c.originalManager || "").toString();
      const curId = (c.manager?._id || c.manager || "").toString();

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
          isTrialSent: Boolean(c.isTrialSent),
          status: c.status,
          partner: c.partner,
          oneCFolder: c.oneCFolder || "Основные покупатели",
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
        orderDates: [] as Date[],
        detailedOrders: [] as any[],
        hasTrialOrder: Boolean(c.isTrialSent),
        segments: [] as string[],
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
      item.orderDates.push(ordDate);
      item.detailedOrders.push({
        _id: ord._id,
        docNumber: ord.docNumber || "—",
        date: ord.date,
        amount: ord.amount,
        insolesCount: ord.insolesCount || 0,
      });

      if (ord.isTrial) {
        item.hasTrialOrder = true;
      }

      totalSalesAll += ord.amount;
      totalIncomeAll += earned;

      if (isYear) {
        item.salesYear += ord.amount;
        item.ordersCountYear += 1;
        item.earnedYear += earned;
        totalSalesYear += ord.amount;
        totalIncomeYear += earned;

        const mIdx = ordDate.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          monthlyGraph[mIdx].sales += ord.amount;
          monthlyGraph[mIdx].income += earned;
          monthlyGraph[mIdx].ordersCount += 1;
        }
      }

      if (isMonth) {
        item.salesMonth += ord.amount;
        item.earnedMonth += earned;
        totalSalesMonth += ord.amount;
        totalIncomeMonth += earned;
      }
    });

    const breakdownList = Object.values(breakdownMap);

    const sortedBySales = [...breakdownList].sort((a, b) => b.salesAll - a.salesAll);
    const vipThreshold = sortedBySales.length > 5 
      ? Math.max(50000, sortedBySales[Math.floor(sortedBySales.length * 0.2)]?.salesAll || 50000)
      : 50000;

    breakdownList.forEach((item) => {
      const segs: string[] = [];
      const count = item.ordersCountAll;
      const dates = item.orderDates;

      if (item.salesAll >= vipThreshold && item.salesAll > 0) segs.push("vip");
      if (item.hasTrialOrder || item.client.isTrialSent) segs.push("trial");
      if (count === 1 && dates.length === 1 && dates[0] < sixMonthsAgo) segs.push("lost_single");
      if (item.client.partner) segs.push("partner_client");

      if (count >= 2) {
        let maxGapDays = 0;
        let isMonthlyPattern = true;

        for (let i = 1; i < dates.length; i++) {
          const diffDays = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > maxGapDays) maxGapDays = diffDays;
          if (diffDays > 45) isMonthlyPattern = false;
        }

        if (isMonthlyPattern && count >= 3) segs.push("regular");
        if (maxGapDays > 60) segs.push("rare");
      }

      item.segments = segs;
    });

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
      isPartnerView: false,
      managerId: targetManagerId,
      summary: {
        totalSalesMonth,
        totalSalesYear,
        totalSalesAll,
        totalIncomeMonth,
        totalIncomeYear,
        totalIncomeAll,
      },
      monthlyGraph,
      clientsBreakdown: breakdownList,
      adminActivity,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка расчета статистики", error: err });
  }
};

// Создание операции взаимозачёта (проведение курса, отгрузка товара)
export const createPartnerOffset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { partnerId, amount, type, comment, date } = req.body;
    const authUser = (req as any).user;

    if (!partnerId || !amount) {
      res.status(400).json({ message: "Укажите партнёра и сумму взаимозачёта" });
      return;
    }

    const offset = await PartnerOffset.create({
      partner: partnerId,
      amount: Number(amount),
      type: type || "course",
      comment: comment || "",
      date: date ? new Date(date) : new Date(),
      createdBy: authUser?.id || authUser?._id,
    });

    res.status(201).json(offset);
  } catch (err) {
    res.status(500).json({ message: "Ошибка добавления взаимозачёта", error: err });
  }
};