import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Building,
  User as UserIconLucide
} from "lucide-react";
import { statsApi } from "../../api/services";

export default function ClientStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [periodTab, setPeriodTab] = useState<"month" | "year" | "all">("month");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Менеджер не передает managerId — бэкенд отдает только его данные по токену
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

  const currentSales = 
    periodTab === "month" ? summary.totalSalesMonth :
    periodTab === "year" ? summary.totalSalesYear : summary.totalSalesAll;

  const currentIncome = 
    periodTab === "month" ? summary.totalIncomeMonth :
    periodTab === "year" ? summary.totalIncomeYear : summary.totalIncomeAll;

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Шапка страницы */}
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
          {/* Начисленная комиссия */}
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

          {/* Объем продаж клиентов */}
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

          {/* Переключатель периода */}
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

        {/* Таблица покупателей менеджера */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-[#576686] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2ABAEF]" />
              <span>Мои покупатели и начисления с их заказов</span>
            </h2>
          </div>

          <div className="flex items-center px-6 mb-3 text-[12px] font-semibold text-[#576686]/80 uppercase tracking-wider">
            <div className="w-[320px]">Покупатель</div>
            <div className="w-[160px]">Заказов ({periodTab === "year" ? "Год" : "Всего"})</div>
            <div className="w-[200px]">Сумма покупок</div>
            <div className="w-[200px]">Мой процент</div>
            <div className="flex-1 text-right">Мой доход</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-[#576686]/60">Расчет данных...</div>
          ) : clientsList.length > 0 ? (
            <div className="flex flex-col gap-3">
              {clientsList.map((item: any, idx: number) => {
                const c = item.client || {};
                const sales = periodTab === "month" ? item.salesMonth : periodTab === "year" ? item.salesYear : item.salesAll;
                const ordersCount = periodTab === "year" ? item.ordersCountYear : item.ordersCountAll;
                const earned = periodTab === "month" ? item.earnedMonth : periodTab === "year" ? item.earnedYear : item.earnedAll;
                const isCompany = c.type === "company";

                return (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-[10px] border border-gray-100 shadow-2xs hover:border-[#2ABAEF]/40 transition-all">
                    <div className="flex items-center gap-3 w-[320px]">
                      <div className="size-9 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#576686] shrink-0">
                        {isCompany ? <Building className="w-4 h-4" /> : <UserIconLucide className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-bold text-[#576686] truncate">{c.name}</div>
                        <div className="text-xs text-[#576686]/60 truncate">
                          {c.city || "Город не указан"} {c.activity ? `• ${c.activity}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="w-[160px] text-sm font-medium text-[#576686] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#576686]/50" />
                      <span>{ordersCount} шт.</span>
                    </div>

                    <div className="w-[200px] text-sm font-bold text-[#576686]">
                      {sales.toLocaleString("ru-RU")} ₽
                    </div>

                    <div className="w-[200px]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.commRate === 10 ? "bg-emerald-100 text-emerald-800" :
                        item.commRate === 9 ? "bg-sky-100 text-sky-800" :
                        item.commRate === 1 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {item.commRate}% {item.relationType === "transferred" ? "(Передан коллеге)" : item.relationType === "received" ? "(Принят от коллеги)" : "(Ваш личный)"}
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
              Пока нет оплаченных заказов от прикрепленных клиентов
            </div>
          )}
        </div>

      </div>
    </div>
  );
}