import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ChevronDown, 
  UserCheck, 
  PhoneOff, 
  AlertCircle, 
  Building, 
  User as UserIconLucide, 
  Award, 
  CalendarCheck, 
  Clock, 
  UserX, 
  Gift,
  Scale,
  Plus,
  X,
  GraduationCap,
  PackageCheck
} from "lucide-react";
import { statsApi, managersApi } from "../api/services";

const MONTH_LABELS = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
];

export default function Stats() {
  const [activeMainTab, setActiveMainTab] = useState<"managers" | "partner">("managers");

  // Состояние для штатных менеджеров
  const [stats, setStats] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [periodTab, setPeriodTab] = useState<"month" | "year" | "all">("month");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  // Состояние для Сетевого Партнёра
  const [partnerStats, setPartnerStats] = useState<any>(null);
  const [isOffsetModalOpen, setIsOffsetModalOpen] = useState(false);
  const [offsetForm, setOffsetForm] = useState({
    amount: "",
    type: "course",
    comment: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [isSubmittingOffset, setIsSubmittingOffset] = useState(false);

  useEffect(() => {
    managersApi.getAll().then((data) => {
      setManagers(data || []);
      if (data && data.length > 0) {
        setSelectedManagerId(data[0]._id);
      }
    }).catch(console.error);
  }, []);

  const loadManagerStats = async () => {
    if (!selectedManagerId) return;
    try {
      setLoading(true);
      const data = await statsApi.get(selectedManagerId);
      setStats(data);
    } catch (err) {
      console.error("Ошибка загрузки статистики:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerStats = async () => {
    try {
      setLoading(true);
      // Передаем partnerId: "any", бэкенд выберет единственного сетевого партнёра
      const data = await statsApi.get(undefined, "any");
      setPartnerStats(data);
    } catch (err) {
      console.error("Ошибка загрузки статистики сетевого партнёра:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === "managers") {
      loadManagerStats();
    } else {
      loadPartnerStats();
    }
  }, [selectedManagerId, activeMainTab]);

  const handleCreateOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerStats?.partnerId || !offsetForm.amount) return;

    try {
      setIsSubmittingOffset(true);
      await statsApi.createPartnerOffset({
        partnerId: partnerStats.partnerId,
        amount: Number(offsetForm.amount),
        type: offsetForm.type,
        comment: offsetForm.comment,
        date: offsetForm.date,
      });
      setIsOffsetModalOpen(false);
      setOffsetForm({ amount: "", type: "course", comment: "", date: new Date().toISOString().slice(0, 10) });
      await loadPartnerStats();
    } catch (err) {
      console.error("Ошибка проведения взаимозачёта:", err);
    } finally {
      setIsSubmittingOffset(false);
    }
  };

  const summary = stats?.summary || {};
  const clientsList = stats?.clientsBreakdown || [];
  const activity = stats?.adminActivity;
  const monthlyGraph = stats?.monthlyGraph || [];

  const currentSales = 
    periodTab === "month" ? summary.totalSalesMonth :
    periodTab === "year" ? summary.totalSalesYear : summary.totalSalesAll;

  const currentIncome = 
    periodTab === "month" ? summary.totalIncomeMonth :
    periodTab === "year" ? summary.totalIncomeYear : summary.totalIncomeAll;

  const filteredClients = clientsList.filter((item: any) => {
    if (segmentFilter === "all") return true;
    if (segmentFilter === "vip") return item.segments?.includes("vip");
    if (segmentFilter === "regular") return item.segments?.includes("regular");
    if (segmentFilter === "rare") return item.segments?.includes("rare");
    if (segmentFilter === "lost_single") return item.segments?.includes("lost_single");
    if (segmentFilter === "trial") return item.segments?.includes("trial");
    return true;
  });

  const countVIP = clientsList.filter((i: any) => i.segments?.includes("vip")).length;
  const countRegular = clientsList.filter((i: any) => i.segments?.includes("regular")).length;
  const countRare = clientsList.filter((i: any) => i.segments?.includes("rare")).length;
  const countLostSingle = clientsList.filter((i: any) => i.segments?.includes("lost_single")).length;
  const countTrial = clientsList.filter((i: any) => i.segments?.includes("trial")).length;

  const maxGraphSales = Math.max(...monthlyGraph.map((m: any) => m.sales || 0), 100000);

  // Партнёрские показатели
  const pSum = partnerStats?.summary || {};
  const pClients = partnerStats?.clients || [];
  const pOffsets = partnerStats?.offsets || [];

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Шапка Администратора */}
        <div className="relative w-full h-[82px] bg-[#576686] rounded-[10px] px-8 flex items-center justify-between z-10 shadow-xs mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[#2ABAEF]" />
            <h1 className="text-white text-[18px] font-bold">
              Аналитика компании, сегментация и взаимозачёты
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Переключатель между Менеджерами и Сетевым партнёром */}
            <div className="flex items-center bg-white/10 p-1 rounded-md border border-white/20">
              <button
                type="button"
                onClick={() => setActiveMainTab("managers")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeMainTab === "managers" ? "bg-white text-[#576686] shadow-xs" : "text-white hover:bg-white/10"
                }`}
              >
                Штатные менеджеры
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("partner")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeMainTab === "partner" ? "bg-white text-[#576686] shadow-xs" : "text-white hover:bg-white/10"
                }`}
              >
                Сетевой партнёр
              </button>
            </div>

            {activeMainTab === "managers" && managers.length > 0 && (
              <div className="relative flex items-center bg-white rounded-md px-3 h-10 shadow-xs">
                <span className="text-xs text-[#576686] mr-2 font-medium">Менеджер:</span>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="bg-transparent text-sm text-[#576686] font-bold outline-none cursor-pointer pr-6 appearance-none"
                >
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#576686] absolute right-2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* ================= ВСПЛЫВАЮЩИЙ РЕЖИМ СЕТЕВОГО ПАРТНЁРА ================= */}
        {activeMainTab === "partner" ? (
          <div>
            {/* Карточки расчёта по стелькам и Баланса долга */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-2xs">
                <span className="text-xs text-[#576686] uppercase font-bold tracking-wider">
                  Продано стелек партнёра
                </span>
                <div className="text-3xl font-bold text-[#576686] mt-2">
                  {(pSum.totalInsolesAll || 0).toLocaleString("ru-RU")} шт.
                </div>
                <p className="text-xs text-[#576686]/60 mt-1">За текущий месяц: {pSum.totalInsolesMonth || 0} шт.</p>
              </div>

              <div className="p-6 rounded-[10px] bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider">
                  Начислено партнёру (120 ₽/шт)
                </span>
                <div className="text-3xl font-bold text-emerald-700 mt-2">
                  {(pSum.bonusAccruedAll || 0).toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-emerald-700/80 mt-1">За месяц: {(pSum.bonusAccruedMonth || 0).toLocaleString("ru-RU")} ₽</p>
              </div>

              <div className="p-6 rounded-[10px] bg-amber-50/70 border border-amber-200 shadow-2xs">
                <span className="text-xs text-amber-800 uppercase font-bold tracking-wider">
                  Взаимозачтено (Курсы/Товар)
                </span>
                <div className="text-3xl font-bold text-amber-700 mt-2">
                  {(pSum.totalOffsetAll || 0).toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-amber-700/80 mt-1">Списано в счёт долга</p>
              </div>

              <div className="p-6 rounded-[10px] bg-sky-50/80 border border-sky-200 shadow-2xs">
                <span className="text-xs text-sky-800 uppercase font-bold tracking-wider">
                  Текущий долг перед партнёром
                </span>
                <div className="text-3xl font-bold text-sky-900 mt-2">
                  {(pSum.balanceDebt || 0).toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-sky-700/80 mt-1">Начислено минус взаимозачёт</p>
              </div>
            </div>

            {/* Блок действий: Проведение взаимозачёта */}
            <div className="mb-8 flex items-center justify-between bg-[#F5F7FA] p-4 rounded-[10px] border border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-[#576686]">Управление балансом сетевого партнёра</h3>
                <p className="text-xs text-[#576686]/60">Списание суммы долга за счёт проведения курсов обучения или отгрузки продукции</p>
              </div>

              <button
                type="button"
                onClick={() => setIsOffsetModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#576686] hover:bg-[#475470] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Провести взаимозачёт</span>
              </button>
            </div>

            {/* Таблица покупателей сетевого партнера */}
            <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs mb-8">
              <h2 className="text-base font-bold text-[#576686] mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2ABAEF]" />
                <span>Покупатели из папки 1С «Сетевые партнёры»</span>
              </h2>

              <div className="flex items-center px-6 mb-3 text-[12px] font-semibold text-[#576686]/80 uppercase tracking-wider">
                <div className="w-[340px]">Покупатель</div>
                <div className="w-[200px]">Город / Штатный менеджер</div>
                <div className="w-[160px]">Стелек продано</div>
                <div className="w-[180px]">Сумма покупок 1С</div>
                <div className="flex-1 text-right">Бонус (120 ₽/шт)</div>
              </div>

              {pClients.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {pClients.map((item: any, idx: number) => {
                    const c = item.client || {};
                    return (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-[10px] border border-gray-100 shadow-2xs">
                        <div className="w-[340px]">
                          <div className="text-sm font-bold text-[#576686]">{c.name}</div>
                          <div className="text-xs text-[#576686]/60">ИНН: {c.inn || "—"}</div>
                        </div>

                        <div className="w-[200px] text-xs text-[#576686]">
                          <div>{c.city || "Город не указан"}</div>
                          <div className="text-[#576686]/60 mt-0.5">Ведёт: {c.manager?.name || "Штатный менеджер"}</div>
                        </div>

                        <div className="w-[160px] text-sm font-bold text-[#576686]">
                          {item.totalInsoles} шт.
                        </div>

                        <div className="w-[180px] text-sm font-bold text-[#576686]">
                          {item.totalAmount.toLocaleString("ru-RU")} ₽
                        </div>

                        <div className="flex-1 text-right text-base font-bold text-emerald-600">
                          {item.bonusTotal.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-[#576686]/60 bg-white rounded-lg border border-gray-100">
                  Пока нет прикреплённых покупателей от сетевого партнёра
                </div>
              )}
            </div>

            {/* Список проведенных взаимозачетов */}
            <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
              <h2 className="text-base font-bold text-[#576686] mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Акт взаимозачётов</span>
              </h2>

              {pOffsets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {pOffsets.map((off: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-gray-200 text-xs text-[#576686]">
                      <div className="flex items-center gap-3">
                        <div className="size-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          {off.type === "course" ? <GraduationCap className="size-4" /> : <PackageCheck className="size-4" />}
                        </div>
                        <div>
                          <span className="font-bold">
                            {off.type === "course" ? "Проведение обучающего курса" : off.type === "goods" ? "Отгрузка товара" : "Выплата"}
                          </span>
                          <span className="text-[#576686]/60 ml-3">{off.comment}</span>
                        </div>
                      </div>
                      <div className="font-bold text-amber-700 text-sm">
                        - {off.amount.toLocaleString("ru-RU")} ₽
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#576686]/60">Взаимозачётов ещё не проводилось</p>
              )}
            </div>
          </div>
        ) : (
          /* ================= ШТАТНЫЙ РЕЖИМ МЕНЕДЖЕРОВ ================= */
          <div>
            {/* Сводные плитки */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#576686] uppercase font-bold tracking-wider">Выручка по менеджеру</span>
                  <DollarSign className="w-5 h-5 text-[#2ABAEF]" />
                </div>
                <div className="text-2xl font-bold text-[#576686]">
                  {(currentSales || 0).toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-[#576686]/60 mt-1">Оплаченные заказы из 1С</p>
              </div>

              <div className="p-6 rounded-[10px] bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider">Начислено менеджеру</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {(currentIncome || 0).toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-emerald-700/80 mt-1">10% — свой / 9% — принятый / 1% — переданный</p>
              </div>

              <div className="p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-2xs flex flex-col justify-between">
                <span className="text-xs text-[#576686] uppercase font-bold tracking-wider mb-2">Период аналитики</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPeriodTab("month")}
                    className={`flex-1 py-1.5 text-xs rounded font-medium transition-all cursor-pointer ${
                      periodTab === "month" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-gray-50"
                    }`}
                  >
                    Месяц
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodTab("year")}
                    className={`flex-1 py-1.5 text-xs rounded font-medium transition-all cursor-pointer ${
                      periodTab === "year" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-gray-50"
                    }`}
                  >
                    Текущий год
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodTab("all")}
                    className={`flex-1 py-1.5 text-xs rounded font-medium transition-all cursor-pointer ${
                      periodTab === "all" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-gray-50"
                    }`}
                  >
                    Всё время
                  </button>
                </div>
              </div>
            </div>

            {/* График динамики */}
            <div className="mb-8 p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-[#576686]">
                    Динамика продаж и начислений за 2026 год
                  </h2>
                  <p className="text-xs text-[#576686]/60 mt-0.5">
                    Сравнение выручки компании по выбранному менеджеру и начисленных комиссий
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-xs bg-[#576686]" />
                    <span className="text-[#576686]">Выручка менеджера</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-xs bg-emerald-500" />
                    <span className="text-[#576686]">Комиссия менеджера</span>
                  </div>
                </div>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-gray-200 pb-2">
                {monthlyGraph.map((item: any, idx: number) => {
                  const heightPercent = Math.round(((item.sales || 0) / maxGraphSales) * 100);
                  const incomeHeight = Math.round(((item.income || 0) / maxGraphSales) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-[#576686] text-white text-[11px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap">
                        <span>Выручка: {(item.sales || 0).toLocaleString("ru-RU")} ₽</span>
                        <span className="text-emerald-300">Комиссия: {(item.income || 0).toLocaleString("ru-RU")} ₽</span>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div 
                          style={{ height: `${Math.max(heightPercent, 4)}%` }} 
                          className={`w-3/5 rounded-t-sm transition-all duration-300 ${item.sales > 0 ? "bg-[#576686] group-hover:bg-[#475470]" : "bg-gray-200/60"}`}
                        />
                        <div 
                          style={{ height: `${Math.max(incomeHeight, item.income > 0 ? 4 : 0)}%` }} 
                          className="w-2/5 bg-emerald-500 rounded-t-sm group-hover:bg-emerald-600 transition-all duration-300"
                        />
                      </div>

                      <span className="text-[11px] font-medium text-[#576686]/70 mt-2">
                        {MONTH_LABELS[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Контроль активности */}
            {activity && (
              <div className="mb-10 p-6 bg-[#F5F7FA] rounded-[10px] border border-gray-200 shadow-xs">
                <h2 className="text-base font-bold text-[#576686] mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#2ABAEF]" />
                  <span>Контроль активности менеджера</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    <span className="text-xs text-[#576686]/70">Новых Лидов в этом месяце</span>
                    <div className="text-2xl font-bold text-[#576686] mt-1">{activity.newLeadsMonth}</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    <span className="text-xs text-[#576686]/70">Были контакты в этом месяце</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{activity.contactedCount || 0}</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                      <PhoneOff className="size-3.5" />
                      <span>Без контакта &gt; 30 дней</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 mt-1">{activity.notContactedCount || 0}</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                      <AlertCircle className="size-3.5" />
                      <span>Просроченные задачи</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">{activity.overdueTasksCount || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Анализ сегментов базы */}
            <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-base font-bold text-[#576686] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2ABAEF]" />
                  <span>Анализ сегментов покупателей</span>
                </h2>

                <div className="flex flex-wrap items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setSegmentFilter("all")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      segmentFilter === "all" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Все ({clientsList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegmentFilter("vip")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      segmentFilter === "vip" ? "bg-amber-600 text-white shadow-xs" : "text-amber-800 hover:bg-white"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Крупные VIP ({countVIP})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegmentFilter("regular")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      segmentFilter === "regular" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:bg-white"
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Регулярные ({countRegular})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegmentFilter("rare")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      segmentFilter === "rare" ? "bg-indigo-600 text-white shadow-xs" : "text-indigo-800 hover:bg-white"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Редкие &gt; 2 мес ({countRare})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegmentFilter("lost_single")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      segmentFilter === "lost_single" ? "bg-rose-600 text-white shadow-xs" : "text-rose-700 hover:bg-white"
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>1 заказ &gt; 6 мес ({countLostSingle})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegmentFilter("trial")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      segmentFilter === "trial" ? "bg-purple-600 text-white shadow-xs" : "text-purple-800 hover:bg-white"
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Пробный заказ ({countTrial})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center px-6 mb-3 text-[12px] font-semibold text-[#576686]/80 uppercase tracking-wider">
                <div className="w-[300px]">Покупатель</div>
                <div className="w-[180px]">Сегмент</div>
                <div className="w-[130px]">Заказов</div>
                <div className="w-[170px]">Сумма продаж</div>
                <div className="w-[150px]">Ставка комиссии</div>
                <div className="flex-1 text-right">Начисленный доход</div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-sm text-[#576686]/60">Расчет показателей...</div>
              ) : filteredClients.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredClients.map((item: any, idx: number) => {
                    const c = item.client || {};
                    const sales = periodTab === "month" ? item.salesMonth : periodTab === "year" ? item.salesYear : item.salesAll;
                    const ordersCount = periodTab === "year" ? item.ordersCountYear : item.ordersCountAll;
                    const earned = periodTab === "month" ? item.earnedMonth : periodTab === "year" ? item.earnedYear : item.earnedAll;
                    const isCompany = c.type === "company";
                    const segs = item.segments || [];

                    return (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-[10px] border border-gray-100 shadow-2xs hover:border-[#2ABAEF]/40 transition-all">
                        <div className="flex items-center gap-3 w-[300px]">
                          <div className="size-9 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#576686] shrink-0">
                            {isCompany ? <Building className="w-4 h-4" /> : <UserIconLucide className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-bold text-[#576686] truncate">{c.name}</div>
                            <div className="text-xs text-[#576686]/60 truncate">
                              {c.city || "Город не указан"} {c.inn ? `• ИНН: ${c.inn}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="w-[180px] flex flex-wrap gap-1">
                          {segs.includes("vip") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Award className="size-3" /> VIP
                            </span>
                          )}
                          {segs.includes("regular") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CalendarCheck className="size-3" /> Регулярный
                            </span>
                          )}
                          {segs.includes("rare") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              <Clock className="size-3" /> Редкий
                            </span>
                          )}
                          {segs.includes("lost_single") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <UserX className="size-3" /> 1 заказ &gt; 6 мес
                            </span>
                          )}
                          {segs.includes("trial") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <Gift className="size-3" /> Пробник
                            </span>
                          )}
                          {segs.length === 0 && <span className="text-xs text-gray-400">—</span>}
                        </div>

                        <div className="w-[130px] text-sm font-medium text-[#576686]">
                          {ordersCount} шт.
                        </div>

                        <div className="w-[170px] text-sm font-bold text-[#576686]">
                          {sales.toLocaleString("ru-RU")} ₽
                        </div>

                        <div className="w-[150px]">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.commRate === 10 ? "bg-emerald-100 text-emerald-800" :
                            item.commRate === 9 ? "bg-sky-100 text-sky-800" :
                            item.commRate === 1 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                          }`}>
                            {item.commRate}% {item.relationType === "transferred" ? "(Передан)" : item.relationType === "received" ? "(Принят)" : "(Свой)"}
                          </span>
                        </div>

                        <div className="flex-1 text-right text-base font-bold text-emerald-600">
                          {Math.round(earned).toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-sm text-[#576686]/60">Нет данных о покупках в данном сегменте</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Модалка проведения взаимозачёта администратором */}
      {isOffsetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[500px] rounded-[10px] bg-[#F5F7FA] p-8 shadow-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setIsOffsetModalOpen(false)}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white text-[#576686] hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              <X className="size-4" />
            </button>

            <h2 className="text-[18px] font-bold text-[#576686] mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span>Проведение взаимозачёта</span>
            </h2>
            <p className="text-xs text-[#576686]/70 mb-6">
              Сумма взаимозачёта уменьшит задолженность компании перед сетевым партнёром.
            </p>

            <form onSubmit={handleCreateOffset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#576686] font-medium">Сумма списания (₽)</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Например: 15000"
                  value={offsetForm.amount}
                  onChange={(e) => setOffsetForm({ ...offsetForm, amount: e.target.value })}
                  className="w-full h-11 bg-white rounded-md border border-[#576686]/20 px-3 text-sm text-[#576686] outline-none focus:border-[#2ABAEF]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#576686] font-medium">Основание взаимозачёта</label>
                <select
                  value={offsetForm.type}
                  onChange={(e) => setOffsetForm({ ...offsetForm, type: e.target.value })}
                  className="w-full h-11 bg-white rounded-md border border-[#576686]/20 px-3 text-sm text-[#576686] outline-none focus:border-[#2ABAEF] cursor-pointer"
                >
                  <option value="course">Проведение обучающего курса</option>
                  <option value="goods">Отгрузка товара / материалов</option>
                  <option value="payout">Прямая денежная выплата</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#576686] font-medium">Дата операции</label>
                <input
                  type="date"
                  required
                  value={offsetForm.date}
                  onChange={(e) => setOffsetForm({ ...offsetForm, date: e.target.value })}
                  className="w-full h-11 bg-white rounded-md border border-[#576686]/20 px-3 text-sm text-[#576686] outline-none focus:border-[#2ABAEF] cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#576686] font-medium">Комментарий к взаимозачёту</label>
                <textarea
                  rows={3}
                  placeholder="Например: Обучение 3 специалистов в филиале партнёра"
                  value={offsetForm.comment}
                  onChange={(e) => setOffsetForm({ ...offsetForm, comment: e.target.value })}
                  className="w-full bg-white rounded-md border border-[#576686]/20 p-3 text-sm text-[#576686] outline-none focus:border-[#2ABAEF] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOffsetModalOpen(false)}
                  className="px-5 h-11 rounded-md bg-white text-[#576686] text-sm border border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingOffset || !offsetForm.amount}
                  className="px-6 h-11 rounded-md bg-[#576686] text-white text-sm font-medium hover:bg-[#475470] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOffset ? "Проведение..." : "Провести взаимозачёт"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}