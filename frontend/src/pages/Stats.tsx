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
  User as UserIconLucide
} from "lucide-react";
import { statsApi, managersApi } from "../api/services";

export default function Stats() {
  const [stats, setStats] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [periodTab, setPeriodTab] = useState<"month" | "year" | "all">("month");

  useEffect(() => {
    managersApi.getAll().then((data) => {
      setManagers(data || []);
      if (data && data.length > 0) {
        setSelectedManagerId(data[0]._id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedManagerId) return;

    const fetchStats = async () => {
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

    fetchStats();
  }, [selectedManagerId]);

  const summary = stats?.summary || {};
  const clientsList = stats?.clientsBreakdown || [];
  const activity = stats?.adminActivity;

  const currentSales = 
    periodTab === "month" ? summary.totalSalesMonth :
    periodTab === "year" ? summary.totalSalesYear : summary.totalSalesAll;

  const currentIncome = 
    periodTab === "month" ? summary.totalIncomeMonth :
    periodTab === "year" ? summary.totalIncomeYear : summary.totalIncomeAll;

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Шапка Администратора с селектором менеджера */}
        <div className="relative w-full h-[82px] bg-[#576686] rounded-[10px] px-8 flex items-center justify-between z-10 shadow-xs mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[#2ABAEF]" />
            <h1 className="text-white text-[18px] font-bold">
              Аналитика продаж и контроль менеджеров
            </h1>
          </div>

          {managers.length > 0 && (
            <div className="relative flex items-center bg-white rounded-md px-3 h-11 shadow-xs">
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

        {/* Сводные плитки выбранного менеджера */}
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

        {/* Блок активности менеджера (Контроль для Администратора) */}
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

            {/* Раскрывающийся список клиентов без контакта > 30 дней */}
            {activity.notContactedClients && activity.notContactedClients.length > 0 && (
              <div className="mt-4 p-4 bg-red-50/50 rounded-lg border border-red-200">
                <p className="text-xs font-bold text-red-700 mb-2">
                  Клиенты без контакта более месяца ({activity.notContactedClients.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {activity.notContactedClients.slice(0, 8).map((nc: any) => (
                    <span key={nc._id} className="text-xs bg-white text-red-800 px-2.5 py-1 rounded-md border border-red-200">
                      {nc.name} ({nc.phone || "без телефона"})
                    </span>
                  ))}
                  {activity.notContactedClients.length > 8 && (
                    <span className="text-xs text-red-600 self-center">...и ещё {activity.notContactedClients.length - 8}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Продажи в разрезе покупателей */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
          <h2 className="text-base font-bold text-[#576686] mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2ABAEF]" />
            <span>Продажи в разрезе покупателей</span>
          </h2>

          <div className="flex items-center px-6 mb-3 text-[12px] font-semibold text-[#576686]/80 uppercase tracking-wider">
            <div className="w-[320px]">Покупатель</div>
            <div className="w-[160px]">Заказов ({periodTab === "year" ? "Год" : "Всего"})</div>
            <div className="w-[200px]">Сумма продаж</div>
            <div className="w-[200px]">Ставка комиссии</div>
            <div className="flex-1 text-right">Начисленный доход</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-[#576686]/60">Расчет показателей...</div>
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
                          {c.city || "Город не указан"} {c.inn ? `• ИНН: ${c.inn}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="w-[160px] text-sm font-medium text-[#576686]">
                      {ordersCount} шт.
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
            <div className="p-12 text-center text-sm text-[#576686]/60">Нет данных о покупках</div>
          )}
        </div>

      </div>
    </div>
  );
}