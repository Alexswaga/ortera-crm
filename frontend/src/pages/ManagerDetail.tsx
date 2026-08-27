import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreVertical, Check, Clock, Trash2, Calendar, X } from "lucide-react";
import { managersApi, tasksApi, clientsApi } from "../api/services";

function BackArrowIcon() {
  return (
    <div className="size-[30px] bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95 transition-all duration-150 shadow-xs">
      <svg className="w-4 h-4 text-[#576686]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function TabTaskIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5H10.5M5.5 8H10.5M5.5 10.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TabClientIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="5.75" r="1.75" fill="currentColor" />
      <path d="M4.2 12.2C4.9 10.3 6.3 9.5 8 9.5C9.7 9.5 11.1 10.3 11.8 12.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CompanyStoreIcon({ className = "w-6 h-6 text-[#576686]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3.5" width="16" height="2.5" rx="0.5" fill="currentColor" />
      <path d="M3.5 7.5L5 12.5H19L20.5 7.5H3.5Z" fill="currentColor" />
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M4.5 13.5H19.5V20.5H4.5V13.5ZM6.5 15H11.5V18.5H6.5V15ZM13.5 15H17.5V20.5H13.5V15Z" 
        fill="currentColor" 
      />
    </svg>
  );
}

function UserAvatarIcon({ className = "w-6 h-6 text-[#576686]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="8.2" r="2.6" fill="currentColor" />
      <path 
        d="M6 18.2C7.2 15.2 9.4 14 12 14C14.6 14 16.8 15.2 18 18.2" 
        stroke="currentColor" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

function EditHeaderIcon() {
  return (
    <svg className="w-4 h-4 text-[#576686]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.3" d="M3.34 6.01L6.65 9.32L9.99 6.01L6.68 2.7L3.34 6.01Z" fill="currentColor"/>
      <path d="M2 11.3333V14H4.66667L12.5267 6.14L9.86 3.47333L2 11.3333ZM13.8867 4.78C14.0372 4.62947 14.1217 4.42525 14.1217 4.21233C14.1217 3.99941 14.0372 3.7952 13.8867 3.64467L12.3553 2.11333C12.2048 1.96282 12.0006 1.8783 11.7877 1.8783C11.5748 1.8783 11.3705 1.96282 11.22 2.11333L10.5333 2.8L13.2 5.46667L13.8867 4.78Z" fill="currentColor"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.33337V12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const clientTags = [
  "Использует стельки других производителей",
  "Наш студент",
  "Постоянный клиент",
  "Хороший человек",
  "Пианист",
  "Любит вино",
  "Танцует и поет",
];

const formatDateTime = (dateStr?: string | Date) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${hours}:${minutes}  /  ${day}.${month}.${year}`;
};

export default function ManagerDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const managerId = searchParams.get("id");

  const [manager, setManager] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [mainTab, setMainTab] = useState<"tasks" | "clients">("tasks");
  const [taskFilterTab, setTaskFilterTab] = useState<"in_work" | "overdue" | "archive">("in_work");
  const [clientFilterTab, setClientFilterTab] = useState<"active" | "inactive">("active");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      let targetId = managerId;

      if (!targetId) {
        const allManagers = await managersApi.getAll();
        if (allManagers.length > 0) {
          targetId = allManagers[0]._id;
        }
      }

      if (targetId) {
        const data = await managersApi.getById(targetId);
        setManager(data.manager);
        setClients(data.clients || []);
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Ошибка загрузки данных менеджера:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, [managerId]);

  const toggleClientStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clientsApi.toggleActive(id);
      setClients((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      console.error("Ошибка переключения статуса клиента:", err);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksApi.complete(taskId);
      loadManagerData();
    } catch (err) {
      console.error("Ошибка завершения задачи:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      loadManagerData();
    } catch (err) {
      console.error("Ошибка удаления задачи:", err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilterTab === "overdue" && t.status !== "overdue") return false;
    if (taskFilterTab === "archive" && t.status !== "completed") return false;
    if (taskFilterTab === "in_work" && t.status !== "in_work") return false;

    if (selectedDateFilter) {
      const startIso = t.startDate ? new Date(t.startDate).toISOString().slice(0, 10) : "";
      const endIso = t.endDate ? new Date(t.endDate).toISOString().slice(0, 10) : "";
      if (startIso !== selectedDateFilter && endIso !== selectedDateFilter) {
        return false;
      }
    }

    return true;
  });

  const filteredClients = clients.filter((c) => {
    const matchesStatus = clientFilterTab === "active" ? c.isActive !== false : c.isActive === false;
    const matchesTag = selectedTag ? (c.tags || []).includes(selectedTag) : true;
    return matchesStatus && matchesTag;
  });

  const managerName = manager?.name || "Менеджер";

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="relative w-full h-[82px] bg-[#576686] rounded-[10px] px-6 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-4">
            <div onClick={() => navigate("/managers")}>
              <BackArrowIcon />
            </div>
            <span className="text-white text-[18px] font-bold">
              {managerName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/managers/add?id=${manager?._id || managerId || ""}`)}
            aria-label="Редактировать менеджера"
            className="size-[30px] bg-[#F5F7FA] rounded-full flex items-center justify-center hover:bg-white hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer text-[#576686]"
          >
            <EditHeaderIcon />
          </button>
        </div>

        <div className="flex items-center gap-2 px-0 mt-[30px]">
          <button
            type="button"
            onClick={() => setMainTab("tasks")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-t-[10px] text-base transition-all duration-200 cursor-pointer ${
              mainTab === "tasks"
                ? "bg-[#F5F7FA] text-[#576686] font-medium shadow-xs"
                : "bg-transparent text-[#576686]/60 hover:text-[#576686] hover:bg-[#F5F7FA]/40"
            }`}
          >
            <TabTaskIcon className="w-4 h-4" />
            <span>Задачи</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("clients")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-t-[10px] text-base transition-all duration-200 cursor-pointer ${
              mainTab === "clients"
                ? "bg-[#F5F7FA] text-[#576686] font-medium shadow-xs"
                : "bg-transparent text-[#576686]/60 hover:text-[#576686] hover:bg-[#F5F7FA]/40"
            }`}
          >
            <TabClientIcon className="w-4 h-4" />
            <span>Клиенты</span>
          </button>
        </div>

        <div className="rounded-b-[10px] rounded-r-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start shadow-xs">
          {mainTab === "tasks" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTaskFilterTab("in_work")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      taskFilterTab === "in_work"
                        ? "bg-white text-[#576686] shadow-sm font-medium"
                        : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    В работе
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskFilterTab("overdue")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      taskFilterTab === "overdue"
                        ? "bg-white text-[#576686] shadow-sm font-medium"
                        : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    Просроченные
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskFilterTab("archive")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      taskFilterTab === "archive"
                        ? "bg-white text-[#576686] shadow-sm font-medium"
                        : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    Архив
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-[#576686] bg-white px-3.5 py-2.5 rounded-md border border-gray-200 shadow-xs">
                    <span>Интервал дат:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="text-[#2ABAEF] font-medium bg-transparent outline-none cursor-pointer text-xs"
                      />
                      {selectedDateFilter ? (
                        <button
                          type="button"
                          onClick={() => setSelectedDateFilter("")}
                          title="Сбросить дату"
                          className="size-4 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-[#2ABAEF] pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/create-task?managerId=${manager?._id || managerId || ""}`)}
                    className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                  >
                    <PlusIcon />
                    <span>Создать задачу</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                  <p className="text-base font-medium">Загрузка задач...</p>
                </div>
              ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTasks.map((task) => {
                    const clientType = task.client?.type || "user";
                    const clientName = task.client?.name || "Клиент не указан";
                    const clientSub = task.client?.city 
                      ? `г. ${task.client.city} / ${task.client?.activity || ""}`
                      : task.client?.activity || "Клиент";
                    const isOverdue = task.status === "overdue";
                    const clientId = task.client?._id || task.client || "";

                    return (
                      <div
                        key={task._id}
                        onClick={() => navigate(clientId ? `/clients/detail?id=${clientId}` : "/clients")}
                        className="relative flex flex-col justify-between rounded-[10px] bg-white p-6 border border-gray-100 shadow-xs hover:shadow-md hover:border-[#2ABAEF]/40 hover:-translate-y-0.5 transition-all duration-150 h-[240px] cursor-pointer group"
                      >
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Опции"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuTaskId(activeMenuTaskId === task._id ? null : task._id);
                            }}
                            className="absolute right-0 top-0 size-[30px] flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-gray-200 transition-colors cursor-pointer text-[#576686]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuTaskId === task._id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 z-30 w-44 rounded-md bg-white p-1.5 shadow-xl border border-gray-100 flex flex-col gap-1 animate-fadeIn"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  handleCompleteTask(task._id);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-[#576686] hover:bg-[#F5F7FA] rounded-sm transition-colors text-left cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Завершить задачу</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  navigate(clientId ? `/clients/detail?id=${clientId}` : "/clients");
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-[#576686] hover:bg-[#F5F7FA] rounded-sm transition-colors text-left cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Отложить задачу</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  handleDeleteTask(task._id);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-sm transition-colors text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Удалить</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[12px] text-[#576686] pr-10">
                          <span>{formatDateTime(task.startDate)}</span>
                          <span className={isOverdue ? "text-[#B77C70] font-medium" : ""}>
                            {task.endDate ? `до ${formatDateTime(task.endDate)}` : ""}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-3 rounded-[10px] bg-[#F5F7FA] p-2.5 w-fit max-w-[85%]">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded">
                            {clientType === "company" ? (
                              <CompanyStoreIcon className="w-6 h-6 text-[#576686]" />
                            ) : (
                              <UserAvatarIcon className="w-6 h-6 text-[#576686]" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="text-[12px] text-[#576686]/70 leading-tight truncate">{clientSub}</div>
                            <div className="text-[14px] font-bold text-[#576686] leading-tight truncate">{clientName}</div>
                          </div>
                        </div>

                        <h3 className="text-[18px] font-bold text-[#576686] line-clamp-2 leading-snug">
                          {task.title}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                  <p className="text-base font-medium">Нет задач, соответствующих фильтрам</p>
                </div>
              )}
            </div>
          )}

          {mainTab === "clients" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setClientFilterTab("active")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      clientFilterTab === "active"
                        ? "bg-white text-[#576686] shadow-sm font-medium"
                        : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    Активные
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientFilterTab("inactive")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      clientFilterTab === "inactive"
                        ? "bg-white text-[#576686] shadow-sm font-medium"
                        : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    Не активные
                  </button>
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

              <div className="flex flex-wrap items-center gap-2.5 mb-8">
                {clientTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer border ${
                      selectedTag === tag
                        ? "bg-[#576686] text-white border-[#576686] shadow-xs"
                        : "bg-transparent text-[#576686] border-[#576686]/20 hover:bg-white hover:border-[#576686]/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center px-5 mb-3 text-[12px] text-[#576686]">
                <div className="w-[338px]">ФИО</div>
                <div className="w-[171px]">Дата регистрации</div>
                <div className="w-[126px]">Город</div>
                <div className="w-[143px]">Деятельность</div>
                <div className="w-[100px]">Задачи</div>
                <div className="flex-1 text-right"></div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                  <p className="text-base font-medium">Загрузка клиентов...</p>
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client._id}
                      onClick={() => navigate(`/clients/detail?id=${client._id}`)}
                      className="flex items-center justify-between rounded-[10px] bg-white px-5 h-12 border border-gray-100 shadow-xs hover:shadow-md hover:border-[#2ABAEF]/40 hover:-translate-y-0.5 transition-all duration-150 text-[#576686] cursor-pointer group"
                    >
                      <div className="w-[338px] text-[16px] truncate font-normal group-hover:text-[#2ABAEF] transition-colors">
                        {client.name}
                      </div>
                      
                      <div className="w-[171px] text-[12px]">
                        {formatDateTime(client.createdAt)}
                      </div>

                      <div className="w-[126px] text-[12px]">
                        {client.city}
                      </div>

                      <div className="w-[143px] text-[12px] truncate pr-2">
                        {client.activity}
                      </div>

                      <div className="w-[100px] text-[12px] text-[#70AF0A] font-medium">
                        {client.tasksCount || 0}
                      </div>

                      <div className="flex items-center gap-4 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => toggleClientStatus(client._id, e)}
                          aria-label="Переключить активность"
                          className={`w-14 h-7 rounded-full relative flex items-center px-1 transition-colors duration-200 cursor-pointer outline-none ${
                            client.isActive !== false ? "bg-[#F5F7FA]" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full transition-all duration-200 transform shadow-xs ${
                              client.isActive !== false ? "bg-[#2ABAEF] translate-x-7" : "bg-[#576686] translate-x-0"
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
                          <EditHeaderIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                  <p className="text-base font-medium">В этой категории нет клиентов</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}