import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { Client } from "./models/Client";
import { Task } from "./models/Task";
import { ScheduleEvent } from "./models/ScheduleEvent";
import { Setting } from "./models/Setting";

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ortera_crm";
    console.log("[Seed] Подключение к MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("[Seed] Успешно подключено к базе данных!");

    console.log("[Seed] Очистка старых данных...");
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Task.deleteMany({}),
      ScheduleEvent.deleteMany({}),
      Setting.deleteMany({}),
    ]);

    console.log("[Seed] Создание пользователей...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    const [admin, manager, clientUser] = await User.create([
      {
        name: "Администратор Ortera",
        email: "admin@ya.ru",
        password: passwordHash,
        role: "admin",
        phone: "+7 900 000 00 00",
      },
      {
        name: "Иванова Настя",
        email: "nastya@ya.ru",
        password: passwordHash,
        role: "manager",
        phone: "+7 927 668 95 18",
      },
      {
        name: "Николаев Дмитрий",
        email: "client@ya.ru",
        password: passwordHash,
        role: "client",
        phone: "+7 927 668 95 18",
      },
    ]);

    console.log("[Seed] Создание клиентов...");
    const [clientIndividual, clientCompany] = await Client.create([
      {
        type: "individual",
        name: "Николаев Дмитрий Александрович",
        activity: "Подолог",
        city: "Чебоксары",
        email: "123@ya.ru",
        phone: "+7 927 668 95 18",
        manager: manager._id,
        status: "Лид",
        isActive: true,
        isCeased: false,
        tags: [
          "Использует стельки других производителей",
          "Постоянный клиент",
          "Хороший человек",
          "Пианист",
          "Любит вино",
          "Танцует и поет",
        ],
        messengers: [
          { messenger: "МАКС", type: "Ссылка", url: "https://max.ru/" },
        ],
      },
      {
        type: "company",
        name: "Стелька Про",
        inn: "7709359770",
        activity: "Ортопедическая клиника",
        city: "Чебоксары",
        email: "org@ya.ru",
        phone: "+7 927 668 95 18",
        manager: manager._id,
        status: "Покупатель",
        isActive: true,
        isCeased: false,
        tags: [
          "Использует стельки других производителей",
          "Наш студент",
          "Постоянный клиент",
        ],
        messengers: [
          { messenger: "МАКС", type: "Ссылка", url: "https://max.ru/company" },
        ],
        employees: [
          {
            name: "Игнатьева Светлана",
            role: "Руководитель",
            phone: "+7 927 668 95 18",
            email: "123@ya.ru",
            messenger: "https://max.ru/usrname4354fgdfd",
          },
        ],
      },
    ]);

    console.log("[Seed] Создание задач...");
    await Task.create([
      {
        title: "Связаться с клиентом Николаевым Д. А. для уточнения информации. Уточнить по оплате, запросить акт выполненных ...",
        description: "Уточнить по оплате и запросить акт выполненных работ",
        client: clientCompany._id,
        manager: manager._id,
        type: "Звонок",
        startDate: new Date("2026-07-16T14:28:00"),
        endDate: new Date("2026-07-17T10:00:00"),
        status: "in_work",
        hasLightning: true,
      },
      {
        title: "Связаться с клиентом Николаевым Д. А. для уточнения информации. Уточнить по оплате, запросить акт выполненных ...",
        description: "Плановый созвон",
        client: clientIndividual._id,
        manager: manager._id,
        type: "Звонок",
        startDate: new Date("2026-07-16T14:28:00"),
        endDate: new Date("2026-07-17T10:00:00"),
        status: "in_work",
        hasLightning: false,
      },
      {
        title: "Отправить КП по стелькам",
        description: "Отправить коммерческое предложение на почту",
        client: clientIndividual._id,
        manager: manager._id,
        type: "Отправить КП",
        startDate: new Date("2026-07-16T14:28:00"),
        endDate: new Date("2026-07-17T10:00:00"),
        status: "overdue",
        hasLightning: false,
      },
    ]);

    console.log("[Seed] Создание обучающих курсов...");
    await ScheduleEvent.create([
      {
        title: "Курс: Производство каркасных стелек",
        location: "Чебоксары",
        startDate: "16.07.2026",
        startTime: "10:00",
        endDate: "17.07.2026",
        endTime: "18:00",
        students: [
          { client: clientIndividual._id, paymentStatus: "paid", manager: manager._id },
          { client: clientIndividual._id, paymentStatus: "advance", manager: manager._id },
        ],
      },
    ]);

    console.log("[Seed] Создание настроек...");
    const tags = [
      "Использует стельки других производителей",
      "Наш студент",
      "Постоянный клиент",
      "Хороший человек",
      "Пианист",
      "Любит вино",
      "Танцует и поет",
    ];
    const specialties = [
      "Ортопедическая клиника",
      "Подолог",
      "Врач ЛФК",
      "Травматолог-ортопед",
      "Массажист",
    ];

    await Promise.all([
      ...tags.map((name) => Setting.create({ type: "tag", name })),
      ...specialties.map((name) => Setting.create({ type: "specialty", name })),
    ]);

    console.log("[Seed] База данных успешно заполнена тестовыми данными!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Ошибка наполнения базы:", error);
    process.exit(1);
  }
};

seedDatabase();