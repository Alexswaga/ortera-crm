import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Building,
  User as UserIconLucide,
  Award,
  CalendarCheck,
  Clock,
  UserX,
  Gift
} from "lucide-react";
import { statsApi } from "../../api/services";

const MONTH_LABELS = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
];

export default function ClientStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [periodTab, setPeriodTab] = useState<"month" | "year" | "all">("month");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statsApi.get();
        setStats(data);
      } catch (err) {
        console.error("Ошибка загрузки личной статистики:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summary = stats?.summary || {};
  const clientsList = stats?.clientsBreakdown || [];
  const monthlyGraph = stats?.monthlyGraph || [];

  const currentSales = 
    periodTab === "month" ? summary.totalSalesMonth :
    periodTab === "year" ? summary.totalSalesYear : summary.totalSalesAll;

  const currentIncome = 
    periodTab === "month" ? summary.totalIncomeMonth :
    periodTab === "year" ? summary.totalIncomeYear : summary.totalIncomeAll;

  // Фильтрация покупателей по выбранному сегменту
  const filteredClients = clientsList.filter((item: any) => {
    if (segmentFilter === "all") return true;
    if (segmentFilter === "vip") return item.segments?.includes("vip");
    if (segmentFilter === "regular") return item.segments?.includes("regular");
    if (segmentFilter === "rare") return item.segments?.includes("rare");
    if (segmentFilter === "lost_single") return item.segments?.includes("lost_single");
    if (segmentFilter === "trial") return item.segments?.includes("trial");
    return true;
  });

  // Подсчет счетчиков сегментов
  const countVIP = clientsList.filter((i: any) => i.segments?.includes("vip")).length;
  const countRegular = clientsList.filter((i: any) => i.segments?.includes("regular")).length;
  const countRare = clientsList.filter((i: any) => i.segments?.includes("rare")).length;
  const countLostSingle = clientsList.filter((i: any) => i.segments?.includes("lost_single")).length;
  const countTrial = clientsList.filter((i: any) => i.segments?.includes("trial")).length;

  // Максимальная сумма месяца для пропорции графика
  const maxGraphSales = Math.max(...monthlyGraph.map((m: any) => m.sales || 0), 100000);

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Шапка */}
        <div className="relative w-full h-[82px] bg-[#576686] rounded-[10px] px-8 flex items-center justify-between z-10 shadow-xs mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[#2ABAEF]" />
            <h1 className="text-white text-[18px] font-bold">
              Мой доход и продажи
            </h1>
          </div>

          <div className="text-xs text-white/80 bg-white/10 px-4 py-2 rounded-full border border-white/15">
            Процентная ставка: <span className="text-[#2ABAEF] font-bold">10%</span> (свой) • <span className="text-[#2ABAEF] font-bold">9%</span> (принятый) • <span className="text-[#2ABAEF] font-bold">1%</span> (переданный)
          </div>
        </div>

        {/* Сводные плитки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-[10px] bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider">
                Мой начисленный доход
              </span>
              <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700">
              {(currentIncome || 0).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-xs text-emerald-700/80 mt-1">
              {periodTab === "month" ? "За текущий месяц" : periodTab === "year" ? "За текущий год" : "За всё время"}
            </p>
          </div>

          <div className="p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#576686] uppercase font-bold tracking-wider">
                Сумма покупок клиентов
              </span>
              <div className="size-8 rounded-full bg-white flex items-center justify-center text-[#2ABAEF] shadow-2xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#576686]">
              {(currentSales || 0).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-xs text-[#576686]/60 mt-1">Оплаченные заказы из 1С</p>
          </div>

          <div className="p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-2xs flex flex-col justify-between">
            <span className="text-xs text-[#576686] uppercase font-bold tracking-wider mb-2">
              Период расчета
            </span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-gray-200">
              <button
                type="button"
                onClick={() => setPeriodTab("month")}
                className={`flex-1 py-2 text-xs rounded font-medium transition-all cursor-pointer ${
                  periodTab === "month" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-gray-50"
                }`}
              >
                Месяц
              </button>
              <button
                type="button"
                onClick={() => setPeriodTab("year")}
                className={`flex-1 py-2 text-xs rounded font-medium transition-all cursor-pointer ${
                  periodTab === "year" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-gray-50"
                }`}
              >
                Текущий год
              </button>
              <button
                type="button"
                onClick={() => setPeriodTab("all")}
                className={`flex-1 py-2 text-xs rounded font-medium transition-all cursor-pointer ${
                  periodTab === "all" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-gray-50"
                }`}
              >
                Всё время
              </button>
            </div>
          </div>
        </div>

        {/* Визуальный график: Динамика продаж по месяцам года */}
        <div className="mb-8 p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#576686]">
                Динамика продаж и дохода (2026 год)
              </h2>
              <p className="text-xs text-[#576686]/60 mt-0.5">
                Помесячный объём заказов покупателей и начисленная комиссия
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-xs bg-[#576686]" />
                <span className="text-[#576686]">Продажи клиентов</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-xs bg-emerald-500" />
                <span className="text-[#576686]">Мой доход</span>
              </div>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-gray-200 pb-2">
            {monthlyGraph.map((item: any, idx: number) => {
              const heightPercent = Math.round(((item.sales || 0) / maxGraphSales) * 100);
              const incomeHeight = Math.round(((item.income || 0) / maxGraphSales) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Всплывающая подсказка при наведении */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-[#576686] text-white text-[11px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap">
                    <span>Продажи: {(item.sales || 0).toLocaleString("ru-RU")} ₽</span>
                    <span className="text-emerald-300">Доход: {(item.income || 0).toLocaleString("ru-RU")} ₽</span>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Столбик продаж */}
                    <div 
                      style={{ height: `${Math.max(heightPercent, 4)}%` }} 
                      className={`w-3/5 rounded-t-sm transition-all duration-300 ${item.sales > 0 ? "bg-[#576686] group-hover:bg-[#475470]" : "bg-gray-200/60"}`}
                    />
                    {/* Столбик дохода */}
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

        {/* Фильтры сегментов клиентов */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-[#576686] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2ABAEF]" />
              <span>Сегменты покупателей</span>
            </h2>

            {/* Вкладки сегментов */}
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

          {/* Заголовки таблицы */}
          <div className="flex items-center px-6 mb-3 text-[12px] font-semibold text-[#576686]/80 uppercase tracking-wider">
            <div className="w-[300px]">Покупатель</div>
            <div className="w-[180px]">Сегмент</div>
            <div className="w-[130px]">Заказов</div>
            <div className="w-[170px]">Сумма покупок</div>
            <div className="w-[150px]">Ставка</div>
            <div className="flex-1 text-right">Мой доход</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-[#576686]/60">Расчет данных...</div>
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

                    {/* Бейджи сегментов */}
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
                      {segs.length === 0 && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>

                    <div className="w-[130px] text-sm font-medium text-[#576686] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#576686]/50" />
                      <span>{ordersCount} шт.</span>
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
                        {item.commRate}% {item.relationType === "transferred" ? "(Передан)" : item.relationType === "received" ? "(Принят)" : "(Ваш)"}
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
            <div className="p-12 text-center text-sm text-[#576686]/60">
              В данном сегменте нет покупателей
            </div>
          )}
        </div>

      </div>
    </div>
  );
}