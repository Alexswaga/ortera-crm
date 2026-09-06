import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Building, 
  User as UserIconLucide, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag,
  GraduationCap,
  PackageCheck,
  Scale,
  FileText
} from "lucide-react";
import { statsApi } from "../../api/services";

export default function PartnerStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodTab, setPeriodTab] = useState<"month" | "year" | "all">("month");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      const data = await statsApi.get();
      setStats(data);
    } catch (err) {
      console.error("Ошибка загрузки данных сетевого партнёра:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const summary = stats?.summary || {};
  const clients = stats?.clients || [];
  const offsets = stats?.offsets || [];

  const currentInsoles =
    periodTab === "month" ? summary.totalInsolesMonth :
    periodTab === "year" ? summary.totalInsolesYear : summary.totalInsolesAll;

  const currentBonus =
    periodTab === "month" ? summary.bonusAccruedMonth :
    periodTab === "year" ? summary.bonusAccruedYear : summary.bonusAccruedAll;

  const currentOffset =
    periodTab === "month" ? summary.totalOffsetMonth :
    periodTab === "year" ? summary.totalOffsetYear : summary.totalOffsetAll;

  const toggleExpand = (id: string) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Шапка кабинета сетевого партнёра */}
        <div className="relative w-full h-[82px] bg-[#576686] rounded-[10px] px-8 flex items-center justify-between z-10 shadow-xs mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[#2ABAEF]" />
            <h1 className="text-white text-[18px] font-bold">
              Кабинет сетевого партнёра: Реализации стелек и баланс взаимозачёта
            </h1>
          </div>

          <div className="text-xs text-white/90 bg-white/10 px-4 py-2 rounded-full border border-white/15">
            Бонус партнёра: <span className="font-bold text-[#2ABAEF]">120 ₽</span> с каждой реализованной стельки
          </div>
        </div>

        {/* Сводные плитки и Баланс */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-[10px] bg-[#F5F7FA] border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#576686] uppercase font-bold tracking-wider">
                Стелек в реализациях
              </span>
              <ShoppingBag className="w-5 h-5 text-[#2ABAEF]" />
            </div>
            <div className="text-3xl font-bold text-[#576686]">
              {(currentInsoles || 0).toLocaleString("ru-RU")} пар
            </div>
            <p className="text-xs text-[#576686]/60 mt-1">Данные из документов 1С</p>
          </div>

          <div className="p-6 rounded-[10px] bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider">
                Начислено бонусов
              </span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-700">
              {(currentBonus || 0).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-xs text-emerald-700/80 mt-1">{currentInsoles || 0} пар × 120 ₽</p>
          </div>

          <div className="p-6 rounded-[10px] bg-amber-50/70 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-800 uppercase font-bold tracking-wider">
                Взаимозачёт (Списано)
              </span>
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-700">
              {(currentOffset || 0).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-xs text-amber-700/80 mt-1">Обучение и отгрузка продукции</p>
          </div>

          <div className="p-6 rounded-[10px] bg-sky-50/80 border border-sky-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-sky-800 uppercase font-bold tracking-wider">
                Текущий баланс к выплате
              </span>
              <TrendingUp className="w-5 h-5 text-[#2ABAEF]" />
            </div>
            <div className="text-3xl font-bold text-sky-900">
              {(summary.balanceDebt || 0).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-xs text-sky-700/80 mt-1">Остаток долга фирмы перед вами</p>
          </div>
        </div>

        {/* Переключатель периода */}
        <div className="flex items-center justify-between mb-8 bg-[#F5F7FA] p-3 rounded-[10px] border border-gray-200">
          <span className="text-sm font-semibold text-[#576686]">Период среза:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeriodTab("month")}
              className={`px-4 py-2 text-xs rounded-md font-medium transition-all cursor-pointer ${
                periodTab === "month" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-white"
              }`}
            >
              Текущий месяц
            </button>
            <button
              type="button"
              onClick={() => setPeriodTab("year")}
              className={`px-4 py-2 text-xs rounded-md font-medium transition-all cursor-pointer ${
                periodTab === "year" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-white"
              }`}
            >
              2026 год
            </button>
            <button
              type="button"
              onClick={() => setPeriodTab("all")}
              className={`px-4 py-2 text-xs rounded-md font-medium transition-all cursor-pointer ${
                periodTab === "all" ? "bg-[#576686] text-white shadow-xs" : "text-[#576686] hover:bg-white"
              }`}
            >
              За всё время
            </button>
          </div>
        </div>

        {/* Таблица Контрагентов из 1С */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs mb-8">
          <h2 className="text-base font-bold text-[#576686] mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2ABAEF]" />
            <span>Контрагенты и количество реализованных стелек</span>
          </h2>

          <div className="flex items-center px-6 mb-3 text-[12px] font-semibold text-[#576686]/80 uppercase tracking-wider">
            <div className="w-[340px]">Контрагент (Покупатель)</div>
            <div className="w-[180px]">Город / Направление</div>
            <div className="w-[140px]">Реализаций 1С</div>
            <div className="w-[160px]">Стелек продано</div>
            <div className="flex-1 text-right">Бонус (120 ₽/пара)</div>
            <div className="w-12"></div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-[#576686]/60">Синхронизация данных с 1С...</div>
          ) : clients.length > 0 ? (
            <div className="flex flex-col gap-3">
              {clients.map((item: any, idx: number) => {
                const c = item.client || {};
                const isCompany = c.type === "company";
                const isExpanded = expandedClientId === c._id;
                const ordersList = item.orders || [];

                return (
                  <div key={idx} className="bg-white rounded-[10px] border border-gray-100 shadow-2xs overflow-hidden transition-all">
                    <div 
                      onClick={() => toggleExpand(c._id)}
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 w-[340px]">
                        <div className="size-9 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#576686] shrink-0">
                          {isCompany ? <Building className="w-4 h-4" /> : <UserIconLucide className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-bold text-[#576686] truncate">{c.name}</div>
                          <div className="text-xs text-[#576686]/60 truncate">
                            ИНН: {c.inn || "—"} {c.manager?.name ? `• Менеджер: ${c.manager.name}` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="w-[180px] text-sm text-[#576686]">
                        {c.city || "Город не указан"}
                        <div className="text-xs text-[#576686]/50">{c.activity || "—"}</div>
                      </div>

                      <div className="w-[140px] text-sm font-medium text-[#576686]">
                        {item.ordersCount} док.
                      </div>

                      <div className="w-[160px] text-sm font-bold text-[#576686]">
                        {item.totalInsoles} пар
                      </div>

                      <div className="flex-1 text-right text-lg font-bold text-emerald-600">
                        {item.bonusTotal.toLocaleString("ru-RU")} ₽
                      </div>

                      <div className="w-12 flex justify-end">
                        <button 
                          type="button"
                          className="size-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#576686] hover:bg-slate-200"
                        >
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Документы реализации из 1С */}
                    {isExpanded && (
                      <div className="px-6 pb-5 pt-2 border-t border-gray-100 bg-[#F5F7FA]/40 animate-fadeIn">
                        <p className="text-xs font-bold text-[#576686] uppercase tracking-wider mb-3">
                          Документы реализации из 1С:УНФ:
                        </p>

                        {ordersList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {ordersList.map((ord: any, oIdx: number) => {
                              const d = new Date(ord.date);
                              const dateFormatted = isNaN(d.getTime()) ? ord.date : d.toLocaleDateString("ru-RU");

                              return (
                                <div key={oIdx} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 text-xs text-[#576686]">
                                  <div className="flex items-center gap-2">
                                    <FileText className="size-3.5 text-[#2ABAEF]" />
                                    <span>Реализация: <b className="font-mono">{ord.docNumber}</b></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[#576686]/70">
                                    <Calendar className="size-3 text-[#576686]/50" />
                                    <span>{dateFormatted}</span>
                                  </div>
                                  <div>
                                    Количество: <b className="text-[#576686]">{ord.insolesCount} пар стелек</b>
                                  </div>
                                  <div className="text-sm font-bold text-emerald-600">
                                    + {ord.bonus.toLocaleString("ru-RU")} ₽
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-[#576686]/60">Пока нет загруженных накладных по данному покупателю</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-[#576686]/60">
              Пока нет прикреплённых покупателей с реализованными стельками
            </div>
          )}
        </div>

        {/* История взаимозачётов */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
          <h2 className="text-base font-bold text-[#576686] mb-6 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            <span>Акт взаимозачётов (Проведённые курсы и отгруженный товар)</span>
          </h2>

          {offsets.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {offsets.map((off: any, idx: number) => {
                const d = new Date(off.date);
                const dateFormatted = isNaN(d.getTime()) ? off.date : d.toLocaleDateString("ru-RU");

                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-2xs text-xs text-[#576686]">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                        {off.type === "course" ? <GraduationCap className="size-4" /> : <PackageCheck className="size-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#576686]">
                          {off.type === "course" ? "Проведение обучающего курса" : off.type === "goods" ? "Отгрузка товара / материалов" : "Прямая выплата"}
                        </div>
                        <div className="text-[11px] text-[#576686]/60 mt-0.5">{off.comment || "Без примечания"}</div>
                      </div>
                    </div>

                    <div className="text-xs text-[#576686]/70">
                      {dateFormatted}
                    </div>

                    <div className="text-sm font-bold text-amber-600">
                      - {off.amount.toLocaleString("ru-RU")} ₽
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#576686]/60 bg-white rounded-lg border border-gray-100">
              Операций взаимозачёта пока не проводилось
            </div>
          )}
        </div>

      </div>
    </div>
  );
}