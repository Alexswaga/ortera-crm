import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Calendar, Check, Clock, Trash2, ChevronDown } from "lucide-react";
import { tasksApi, managersApi } from "../api/services";

function CreateTaskDocIcon({ className = "w-4 h-4 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M8.5 2H3.5C2.67157 2 2 2.67157 2 3.5V12.5C2 13.3284 2.67157 14 3.5 14H10.5C11.3284 14 12 13.3284 12 12.5V7" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />
      <path d="M4.5 6H8.5M4.5 8.5H9.5M4.5 11H9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 1.5V6.5M9.5 4H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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

function ManagerRowIcon() {
  return (
    <svg className="w-4 h-4 text-[#576686]/60 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.0026 8.14667C14.0026 4.48667 11.1626 2 8.0026 2C4.87594 2 2.0026 4.43333 2.0026 8.18667C1.6026 8.41333 1.33594 8.84 1.33594 9.33333V10.6667C1.33594 11.4 1.93594 12 2.66927 12H3.33594V7.93333C3.33594 5.35333 5.4226 3.26667 8.0026 3.26667C10.5826 3.26667 12.6693 5.35333 12.6693 7.93333V12.6667H7.33594V14H12.6693C13.4026 14 14.0026 13.4 14.0026 12.6667V11.8533C14.3959 11.6467 14.6693 11.24 14.6693 10.76V9.22667C14.6693 8.76 14.3959 8.35333 14.0026 8.14667Z" fill="currentColor" />
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

export default function TaskList() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManagerFilter, setSelectedManagerFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"in_work" | "overdue" | "archive">("in_work");
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  useEffect(() => {
    managersApi.getAll().then((data) => setManagers(data)).catch(() => {});
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filterStatus = activeTab === "archive" ? "completed" : activeTab;
      const params: any = { status: filterStatus };
      if (selectedManagerFilter) {
        params.managerId = selectedManagerFilter;
      }
      const data = await tasksApi.getAll(params);
      setTasks(data);
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeTab, selectedManagerFilter]);

  const handleComplete = async (taskId: string) => {
    try {
      await tasksApi.complete(taskId);
      loadTasks();
    } catch (error) {
      console.error("Ошибка при завершении задачи:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      loadTasks();
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter']">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("in_work")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-colors cursor-pointer ${
                    activeTab === "in_work"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white"
                  }`}
                >
                  В работе
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("overdue")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-colors cursor-pointer ${
                    activeTab === "overdue"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white"
                  }`}
                >
                  Просроченные
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("archive")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-colors cursor-pointer ${
                    activeTab === "archive"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white"
                  }`}
                >
                  Архив
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-[#576686]">
                  <span>Интервал дат:</span>
                  <span className="text-[#2ABAEF] font-medium flex items-center gap-1">
                    19.07.2026
                    <Calendar className="w-3 h-3" />
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#576686] relative">
                  <span>Менеджер:</span>
                  <div className="relative inline-block">
                    <select
                      value={selectedManagerFilter}
                      onChange={(e) => setSelectedManagerFilter(e.target.value)}
                      className="bg-transparent text-[#2ABAEF] font-medium appearance-none pr-5 outline-none cursor-pointer"
                    >
                      <option value="">Все менеджеры</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#2ABAEF] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/create-task")}
                  className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white hover:bg-[#576686]/90 transition-colors cursor-pointer"
                >
                  <CreateTaskDocIcon />
                  <span>Создать задачу</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 text-[#576686]/60">
                <p className="text-base">Загрузка задач...</p>
              </div>
            ) : tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map((task) => {
                  const isOverdue = task.status === "overdue";
                  const clientType = task.client?.type || "user";
                  const clientName = task.client?.name || "Клиент не указан";
                  const clientSub = task.client?.city 
                    ? `${task.client.city} / ${task.client?.activity || ""}` 
                    : task.client?.activity || "Клиент";
                  const managerName = task.manager?.name || "Не назначен";
                  const clientId = task.client?._id || task.client || "";

                  return (
                    <div
                      key={task._id}
                      onClick={() => navigate(clientId ? `/clients/detail?id=${clientId}` : "/clients")}
                      className="relative flex flex-col justify-between rounded-[10px] bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-[264px] cursor-pointer"
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
                            className="absolute right-0 top-9 z-30 w-44 rounded-md bg-white p-1.5 shadow-xl border border-gray-100 flex flex-col gap-1"
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

                      <div className="flex items-center gap-2 text-[12px] text-[#576686]">
                        <ManagerRowIcon />
                        <span>{managerName}</span>
                      </div>
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