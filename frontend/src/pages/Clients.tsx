import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Building, User as UserIconLucide } from "lucide-react";
import { clientsApi } from "../api/services";

function PlusIcon() {
  return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.33337V12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ManagerRowIcon({ className = "w-4 h-4 text-[#576686]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.0026 8.14667C14.0026 4.48667 11.1626 2 8.0026 2C4.87594 2 2.0026 4.43333 2.0026 8.18667C1.6026 8.41333 1.33594 8.84 1.33594 9.33333V10.6667C1.33594 11.4 1.93594 12 2.66927 12H3.33594V7.93333C3.33594 5.35333 5.4226 3.26667 8.0026 3.26667C10.5826 3.26667 12.6693 5.35333 12.6693 7.93333V12.6667H7.33594V14H12.6693C13.4026 14 14.0026 13.4 14.0026 12.6667V11.8533C14.3959 11.6467 14.6693 11.24 14.6693 10.76V9.22667C14.6693 8.76 14.3959 8.35333 14.0026 8.14667Z"
        fill="currentColor"
      />
      <circle cx="6" cy="9.3" r="0.75" fill="currentColor" />
      <circle cx="10" cy="9.3" r="0.75" fill="currentColor" />
      <path d="M4.5 8C5.8 7.3 7 5.8 7.3 4.2C8.2 5.8 9.8 7 11.8 7.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function EditRowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.3" d="M3.34 6.01L6.65 9.32L9.99 6.01L6.68 2.7L3.34 6.01Z" fill="currentColor"/>
      <path d="M2 11.3333V14H4.66667L12.5267 6.14L9.86 3.47333L2 11.3333ZM13.8867 4.78C14.0372 4.62947 14.1217 4.42525 14.1217 4.21233C14.1217 3.99941 14.0372 3.7952 13.8867 3.64467L12.3553 2.11333C12.2048 1.96282 12.0006 1.8783 11.7877 1.8783C11.5748 1.8783 11.3705 1.96282 11.22 2.11333L10.5333 2.8L13.2 5.46667L13.8867 4.78Z" fill="currentColor"/>
    </svg>
  );
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Два независимых фильтра
  const [typeFilter, setTypeFilter] = useState<"all" | "orgs" | "private">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const toggleClientActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clientsApi.toggleActive(id);
      setClients((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (error) {
      console.error("Ошибка при смене активности клиента:", error);
    }
  };

  const filteredClients = clients.filter((client) => {
    // 1. Фильтр по типу
    if (typeFilter === "orgs" && client.type !== "company") return false;
    if (typeFilter === "private" && client.type === "company") return false;

    // 2. Фильтр по активности (независимый)
    if (statusFilter === "active" && !client.isActive) return false;
    if (statusFilter === "inactive" && client.isActive) return false;

    return true;
  });

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-6">
                {/* Группа 1: Тип клиента */}
                <div className="flex items-center gap-2 bg-white/60 p-1 rounded-[12px] border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setTypeFilter("all")}
                    className={`rounded-[8px] px-4 py-2.5 text-sm transition-all cursor-pointer ${
                      typeFilter === "all"
                        ? "bg-[#576686] text-white shadow-xs font-medium"
                        : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Все
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter("orgs")}
                    className={`rounded-[8px] px-4 py-2.5 text-sm transition-all cursor-pointer ${
                      typeFilter === "orgs"
                        ? "bg-[#576686] text-white shadow-xs font-medium"
                        : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Организации
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter("private")}
                    className={`rounded-[8px] px-4 py-2.5 text-sm transition-all cursor-pointer ${
                      typeFilter === "private"
                        ? "bg-[#576686] text-white shadow-xs font-medium"
                        : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Частники
                  </button>
                </div>

                {/* Группа 2: Активность (независимая) */}
                <div className="flex items-center gap-2 bg-white/60 p-1 rounded-[12px] border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`rounded-[8px] px-4 py-2.5 text-sm transition-all cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-[#576686] text-white shadow-xs font-medium"
                        : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Все статусы
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`rounded-[8px] px-4 py-2.5 text-sm transition-all cursor-pointer ${
                      statusFilter === "active"
                        ? "bg-[#576686] text-white shadow-xs font-medium"
                        : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Активные
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("inactive")}
                    className={`rounded-[8px] px-4 py-2.5 text-sm transition-all cursor-pointer ${
                      statusFilter === "inactive"
                        ? "bg-[#576686] text-white shadow-xs font-medium"
                        : "text-[#576686] hover:bg-white"
                    }`}
                  >
                    Не активные
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/clients/add")}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] pt-4 pb-[17px] pl-3 pr-5 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <PlusIcon />
                <span>Добавить клиента</span>
              </button>
            </div>

            {/* Заголовки таблицы: Вместо Даты регистрации теперь Телефон */}
            <div className="flex items-center px-6 mb-3 text-[12px] text-[#576686]">
              <div className="w-[338px] pl-6">ФИО</div>
              <div className="w-[171px]">Телефон</div>
              <div className="w-[126px]">Город</div>
              <div className="w-[210px]">Деятельность</div>
              <div className="w-[175px]">Менеджер</div>
              <div className="w-[80px]">Задачи</div>
              <div className="flex-1 text-right"></div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                <p className="text-base font-medium">Загрузка клиентов...</p>
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredClients.map((client) => {
                  const isCompany = client.type === "company";
                  const managerName = client.manager?.name || "Не назначен";
                  const displayPhone = client.phone || "Не указан";
                  const displayBadge = client.status || "Лид";
                  const clientTagsList = client.tags || [];

                  return (
                    <div
                      key={client._id}
                      onClick={() => navigate(`/clients/detail?id=${client._id}`)}
                      className="flex flex-col justify-center rounded-[10px] bg-white px-6 py-3 border border-gray-100 shadow-xs hover:shadow-md hover:border-[#2ABAEF]/40 hover:-translate-y-0.5 transition-all duration-150 text-[#576686] cursor-pointer group min-h-[76px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-[338px] flex items-center gap-3">
                          <div className="shrink-0">
                            {isCompany ? (
                              <Building className="w-4 h-4 text-[#576686]" />
                            ) : (
                              <UserIconLucide className="w-4 h-4 text-[#576686]" />
                            )}
                          </div>
                          <span className="text-[16px] font-normal truncate group-hover:text-[#2ABAEF] transition-colors">
                            {client.name}
                          </span>
                        </div>

                        {/* Столбец Телефон */}
                        <div className="w-[171px] text-[12px] flex items-center gap-1.5 truncate">
                          <Phone className="size-3 text-[#576686]/50 shrink-0" />
                          <span className="truncate">{displayPhone}</span>
                        </div>

                        <div className="w-[126px] text-[12px]">
                          {client.city}
                        </div>

                        <div className="w-[210px] text-[12px] truncate pr-4">
                          {client.activity}
                        </div>

                        <div className="w-[175px] flex items-center gap-2 text-[12px]">
                          <ManagerRowIcon className="w-4 h-4 text-[#576686]" />
                          <span>{managerName}</span>
                        </div>

                        <div className="w-[80px] text-[12px] text-[#70AF0A] font-medium">
                          {client.tasksCount || 0}
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                          <div className="px-3.5 py-1 bg-[#F5F7FA] rounded-full text-[12px] text-[#576686]">
                            {displayBadge}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleClientActive(client._id, e)}
                            aria-label="Переключить статус клиента"
                            className={`w-14 h-7 rounded-full relative flex items-center px-1 transition-colors duration-200 cursor-pointer outline-none ${
                              client.isActive ? "bg-[#F5F7FA]" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full transition-all duration-200 transform shadow-xs ${
                                client.isActive ? "bg-[#2ABAEF] translate-x-7" : "bg-[#576686] translate-x-0"
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clients/add?id=${client._id}`);
                            }}
                            aria-label="Редактировать клиента"
                            className="size-7 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#576686] hover:text-white active:scale-90 transition-all duration-150 cursor-pointer text-[#576686]"
                          >
                            <EditRowIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {clientTagsList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pl-7 text-[12px] text-[#576686]/60">
                          {clientTagsList.map((t: string, idx: number) => (
                            <span key={idx} className="whitespace-nowrap hover:text-[#576686] transition-colors">
                              # {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                <p className="text-base font-medium">В этой категории нет клиентов</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}