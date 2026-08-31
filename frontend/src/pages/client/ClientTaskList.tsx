import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Calendar, Check, Clock, Trash2, X } from "lucide-react";
import { tasksApi } from "../../api/services";

function LightningBadge() {
  return (
    <div className="flex items-center gap-1.5 shrink-0 select-none">
      <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-[#2ABAEF]" />
      <div className="size-7 rounded-full bg-[#576686] flex items-center justify-center text-white shadow-xs">
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.33333 1.33334L2.66667 9.33334H8L6.66667 14.6667L13.3333 6.66668H8L9.33333 1.33334Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}

function CreateTaskDocIcon({ className = "w-4 h-4 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M8.5 2H3.5C2.67157 2 2 2.67157 2 3.5V12.5C2 13.3284 2.67157 14 3.5 14H10.5C11.3284 14 12 13.3284 12 12.5V7" 
        stroke="currentColor" 
        strokeWidth="1.6" 
        strokeLinecap="round" 
      />
      <path d="M4.5 6H8.5M4.5 8.5H9.5M4.5 11H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M12 1.5V6.5M9.5 4H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
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

const formatDateTime = (dateString?: string | Date) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${hours}:${minutes} / ${day}.${month}.${year}`;
};

const toLocalDateString = (dateInput?: string | Date) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function ClientTaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"in_work" | "overdue" | "archive">("in_work");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filterStatus = activeTab === "archive" ? "completed" : activeTab;
      const data = await tasksApi.getAll({ status: filterStatus });
      setTasks(data);
    } catch (error) {
      console.error("Ошибка загрузки задач клиента:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeTab]);

  const handleComplete = async (taskId: string) => {
    try {
      await tasksApi.complete(taskId);
      loadTasks();
    } catch (error) {
      console.error("Ошибка завершения задачи:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      loadTasks();
    } catch (error) {
      console.error("Ошибка удаления задачи:", error);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!selectedDateFilter) return true;
    const startStr = toLocalDateString(t.startDate);
    const endStr = toLocalDateString(t.endDate);
    return startStr === selectedDateFilter || endStr === selectedDateFilter;
  });

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("in_work")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "in_work"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  В работе
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("overdue")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "overdue"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  Просроченные
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("archive")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "archive"
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
                  onClick={() => navigate("/client/create-task")}
                  className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-normal"
                >
                  <CreateTaskDocIcon />
                  <span>Создать задачу</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 text-[#576686]/60">
                <p className="text-base font-medium">Загрузка задач...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTasks.map((task) => {
                  const isOverdue = task.status === "overdue";
                  const clientType = task.client?.type || "user";
                  const clientName = task.client?.name || "Клиент не указан";
                  const clientSub = task.client?.city 
                    ? `г. ${task.client.city} / ${task.client?.activity || ""}`
                    : task.client?.activity || "Клиент";
                  const clientId = task.client?._id || task.client || "";

                  return (
                    <div
                      key={task._id}
                      onClick={() => navigate(clientId ? `/client/clients/detail?id=${clientId}` : "/client/clients")}
                      className="relative flex flex-col justify-between rounded-[10px] bg-white p-6 border border-gray-100 shadow-xs hover:shadow-md hover:border-[#2ABAEF]/40 hover:-translate-y-0.5 transition-all duration-150 h-[240px] cursor-pointer"
                    >
                      <div className="absolute right-5 top-5 flex items-center gap-2 z-20">
                        {task.hasLightning && <LightningBadge />}

                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Опции"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuTaskId(activeMenuTaskId === task._id ? null : task._id);
                            }}
                            className="size-7 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-slate-200 transition-colors cursor-pointer text-[#576686]"
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
                                  handleComplete(task._id);
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
                                  navigate(clientId ? `/client/clients/detail?id=${clientId}` : "/client/clients");
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
                                  handleDelete(task._id);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-sm transition-colors text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Удалить</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[12px] text-[#576686] pr-20">
                        <span>{formatDateTime(task.startDate)}</span>
                        <span className={isOverdue ? "text-stone-400 font-medium" : ""}>
                          {task.endDate ? `до ${formatDateTime(task.endDate)}` : ""}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-3 rounded-[10px] bg-[#F5F7FA] p-2.5 w-fit max-w-[80%]">
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
              <div className="flex flex-col items-center justify-center h-96 text-[#576686]/60">
                <p className="text-lg">Нет задач в этой категории</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}