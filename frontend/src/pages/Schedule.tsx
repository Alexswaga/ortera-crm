import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical,
  X,
  Search,
  Check,
  Trash2
} from "lucide-react";
import { scheduleApi, clientsApi } from "../api/services";

function CalendarEventIcon({ className = "w-4 h-4 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 1.5V3.5M11.5 1.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path 
        d="M2.5 4.5H13.5V13C13.5 13.5523 13.0523 14 12.5 14H3.5C2.94772 14 2.5 13.5523 2.5 13V4.5Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <rect x="8" y="8" width="3" height="3" fill="currentColor" rx="0.5" />
    </svg>
  );
}

function UserBadgeIcon({ className = "w-3.5 h-3.5 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="5.75" r="1.75" fill="currentColor" />
      <path d="M4.2 12.2C4.9 10.3 6.3 9.5 8 9.5C9.7 9.5 11.1 10.3 11.8 12.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ManagerRowIcon({ className = "w-4 h-4 text-[#576686]/60 shrink-0" }: { className?: string }) {
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

function EditIcon({ className = "w-4 h-4 text-[#576686]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.3" d="M3.34 6.01L6.65 9.32L9.99 6.01L6.68 2.7L3.34 6.01Z" fill="currentColor"/>
      <path d="M2 11.3333V14H4.66667L12.5267 6.14L9.86 3.47333L2 11.3333ZM13.8867 4.78C14.0372 4.62947 14.1217 4.42525 14.1217 4.21233C14.1217 3.99941 14.0372 3.7952 13.8867 3.64467L12.3553 2.11333C12.2048 1.96282 12.0006 1.8783 11.7877 1.8783C11.5748 1.8783 11.3705 1.96282 11.22 2.11333L10.5333 2.8L13.2 5.46667L13.8867 4.78Z" fill="currentColor"/>
    </svg>
  );
}

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const parseEventDate = (dStr?: string | Date): Date | null => {
  if (!dStr) return null;
  if (dStr instanceof Date) return isNaN(dStr.getTime()) ? null : dStr;
  if (typeof dStr === "string") {
    if (dStr.includes(".")) {
      const parts = dStr.trim().split(/\s+/)[0].split(".");
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    const parsed = new Date(dStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export default function Schedule() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [courses, setCourses] = useState<any[]>([]);
  const [openCourseIds, setOpenCourseIds] = useState<Record<string, boolean>>({});
  const [currentYear, setCurrentYear] = useState(2026);
  const [loading, setLoading] = useState(true);

  const [openStatusMenuKey, setOpenStatusMenuKey] = useState<string | null>(null);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleApi.getAll();
      setCourses(data);
      if (data.length > 0) {
        setOpenCourseIds({ [data[0]._id]: true });
      }
    } catch (err) {
      console.error("Ошибка загрузки графика обучения:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const toggleCourse = (id: string) => {
    setOpenCourseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAddStudent = async (courseId: string) => {
    setTargetCourseId(courseId);
    setSelectedClientId("");
    setClientSearchQuery("");
    setIsAddStudentOpen(true);
    try {
      const clients = await clientsApi.getAll();
      setClientsList(clients);
      if (clients.length > 0) {
        setSelectedClientId(clients[0]._id);
      }
    } catch (err) {
      console.error("Ошибка загрузки списка клиентов:", err);
    }
  };

  const handleAddStudentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetCourseId || !selectedClientId) return;

    setIsSubmittingStudent(true);
    try {
      await scheduleApi.addStudent(targetCourseId, {
        clientId: selectedClientId,
        paymentStatus: "advance",
      });
      setIsAddStudentOpen(false);
      await loadSchedule();
    } catch (err) {
      console.error("Ошибка добавления студента на курс:", err);
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleRemoveStudent = async (courseId: string, studentId: string) => {
    if (!window.confirm("Удалить клиента из списка участников курса?")) return;
    try {
      await scheduleApi.removeStudent(courseId, studentId);
      await loadSchedule();
    } catch (err) {
      console.error("Ошибка удаления студента:", err);
    }
  };

  const handleStatusChange = async (courseId: string, studentId: string, newStatus: string) => {
    try {
      setOpenStatusMenuKey(null);
      await scheduleApi.updateStudentStatus(courseId, studentId, newStatus);
      await loadSchedule();
    } catch (err) {
      console.error("Ошибка смены статуса оплаты:", err);
    }
  };

  const getMonthCalendar = (monthIndex: number) => {
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, monthIndex, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7;

    const highlightedMap: Record<number, { isSingle: boolean; isRange: boolean; isStart: boolean; isEnd: boolean }> = {};

    courses.forEach((course) => {
      const start = parseEventDate(course.startDate);
      const end = parseEventDate(course.endDate) || start;

      if (!start) return;

      const cur = new Date(start);
      const isMultiDay = end && end.getTime() !== start.getTime();

      while (end && cur <= end) {
        if (cur.getFullYear() === currentYear && cur.getMonth() === monthIndex) {
          const d = cur.getDate();
          const isStart = cur.getTime() === start.getTime();
          const isEnd = cur.getTime() === end.getTime();

          highlightedMap[d] = {
            isSingle: !isMultiDay,
            isRange: !!isMultiDay,
            isStart,
            isEnd,
          };
        }
        cur.setDate(cur.getDate() + 1);
      }
    });

    return { daysInMonth, startOffset, highlightedMap };
  };

  const filteredModalClients = clientsList.filter((c) =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      viewMode === "list"
                        ? "bg-[#576686] text-white shadow-sm font-medium"
                        : "bg-white text-[#576686] hover:bg-slate-100 hover:text-slate-800 border border-gray-200"
                    }`}
                  >
                    Список
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                      viewMode === "calendar"
                        ? "bg-[#576686] text-white shadow-sm font-medium"
                        : "bg-white text-[#576686] hover:bg-slate-100 hover:text-slate-800 border border-gray-200"
                    }`}
                  >
                    Календарь
                  </button>
                </div>

                {viewMode === "calendar" && (
                  <div className="flex items-center gap-3 ml-4 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => setCurrentYear((prev) => prev - 1)}
                      className="size-8 bg-white rounded-full flex items-center justify-center text-[#576686] hover:bg-slate-100 active:scale-95 transition-all shadow-xs cursor-pointer border border-gray-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="text-lg text-[#576686] font-bold min-w-[56px] text-center select-none">
                      {currentYear}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCurrentYear((prev) => prev + 1)}
                      className="size-8 bg-white rounded-full flex items-center justify-center text-[#576686] hover:bg-slate-100 active:scale-95 transition-all shadow-xs cursor-pointer border border-gray-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/schedule/add")}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-normal"
              >
                <CalendarEventIcon className="w-4 h-4 text-white" />
                <span>Добавить событие</span>
              </button>
            </div>

            {viewMode === "list" && (
              <div>
                {/* Шапка таблицы: Город выровнен влево */}
                <div className="flex items-center px-8 mb-3 text-[12px] text-[#576686]">
                  <div className="w-[350px]">Дата</div>
                  <div className="flex-1 pl-4">Название курса</div>
                  <div className="w-[200px] text-left">Город</div>
                  <div className="w-[160px] text-right"></div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                    <p className="text-base font-medium">Загрузка расписания...</p>
                  </div>
                ) : courses.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {courses.map((course) => {
                      const isOpened = !openCourseIds[course._id];
                      const displayDate = course.startDate === course.endDate || !course.endDate
                        ? course.startDate
                        : `${course.startDate} - ${course.endDate}`;
                      const studentsList = course.students || [];
                      const maxStudents = course.maxStudents ? Number(course.maxStudents) : 10;
                      const freeSlotsCount = Math.max(0, maxStudents - studentsList.length);

                      return (
                        <div
                          key={course._id}
                          className="rounded-[10px] bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all duration-150 overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-8 h-24 text-[#576686]">
                            <div className="w-[350px] text-[16px] font-normal">
                              {displayDate}
                            </div>

                            <div className="flex-1 pl-4 text-[18px] font-bold">
                              {course.title}
                            </div>

                            {/* Крупный город по левому краю */}
                            <div className="w-[200px] text-[18px] font-bold text-[#576686] text-left truncate">
                              {course.location || "Чебоксары"}
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="h-7 px-3.5 bg-[#576686] rounded-full flex items-center justify-center gap-2 text-white text-[11px] shadow-xs">
                                <UserBadgeIcon className="w-3.5 h-3.5 text-white" />
                                <span className="font-medium">{studentsList.length}/{maxStudents}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => navigate(`/schedule/add?id=${course._id}`)}
                                aria-label="Редактировать курс"
                                className="size-7 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#576686] hover:text-white active:scale-95 transition-all duration-150 cursor-pointer text-[#576686]"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleCourse(course._id)}
                                aria-label="Развернуть курс"
                                className="size-7 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-slate-200 active:scale-95 transition-all duration-150 cursor-pointer text-[#576686]"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isOpened ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {isOpened && (
                            <div className="px-8 pb-8 flex flex-col gap-3 border-t border-gray-50 pt-4 animate-fadeIn">
                              {/* 1. Занятые места (ученики) */}
                              {studentsList.map((studentItem: any, idx: number) => {
                                const stClient = studentItem.client || {};
                                const stManager = studentItem.manager || {};
                                const stName = stClient.name || "Клиент";
                                const stRole = stClient.city ? `г. ${stClient.city} / ${stClient.activity || "Подолог"}` : "г. Чебоксары / Подолог";
                                const stPhone = stClient.phone || "Не указан";
                                const stManagerName = stManager.name || "Иванова Настя";
                                const paymentSt = studentItem.paymentStatus || "advance";
                                const itemKey = `${course._id}-${studentItem._id || idx}`;

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between h-14 px-5 rounded-[10px] bg-[#F5F7FA] text-[#576686] text-sm hover:bg-slate-100 transition-colors relative"
                                  >
                                    <div 
                                      onClick={() => stClient._id && navigate(`/clients/detail?id=${stClient._id}`)}
                                      className="w-[300px] text-[16px] font-normal truncate cursor-pointer hover:text-[#2ABAEF]"
                                    >
                                      {stName}
                                    </div>

                                    <div className="w-[190px] text-[12px]">
                                      {stRole}
                                    </div>

                                    <div className="w-[170px] text-[12px]">
                                      {stPhone}
                                    </div>

                                    {/* Статус оплаты */}
                                    <div className="w-[140px] relative">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenStatusMenuKey(openStatusMenuKey === itemKey ? null : itemKey);
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-normal uppercase transition-colors shadow-2xs cursor-pointer ${
                                          paymentSt === "paid"
                                            ? "bg-[#22C55E] hover:bg-green-600"
                                            : "bg-[#3B82F6] hover:bg-blue-600"
                                        }`}
                                      >
                                        <span>{paymentSt === "paid" ? "Оплачено" : "Аванс"}</span>
                                        <ChevronDown className="w-3 h-3 text-white/90" />
                                      </button>

                                      {openStatusMenuKey === itemKey && (
                                        <div 
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute left-0 top-9 z-30 w-36 rounded-md bg-white p-1 shadow-xl border border-gray-100 flex flex-col gap-0.5 animate-fadeIn"
                                        >
                                          <button
                                            type="button"
                                            onClick={() => handleStatusChange(course._id, studentItem._id, "paid")}
                                            className="flex items-center justify-between px-3 py-2 text-xs text-[#576686] hover:bg-[#F5F7FA] rounded-sm transition-colors text-left cursor-pointer"
                                          >
                                            <span className="text-[#22C55E] font-medium">Оплачено</span>
                                            {paymentSt === "paid" && <Check className="w-3.5 h-3.5 text-[#22C55E]" />}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleStatusChange(course._id, studentItem._id, "advance")}
                                            className="flex items-center justify-between px-3 py-2 text-xs text-[#576686] hover:bg-[#F5F7FA] rounded-sm transition-colors text-left cursor-pointer"
                                          >
                                            <span className="text-[#3B82F6] font-medium">Аванс</span>
                                            {paymentSt === "advance" && <Check className="w-3.5 h-3.5 text-[#3B82F6]" />}
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <div className="w-[160px] flex items-center gap-2 text-[12px] text-[#576686]">
                                      <ManagerRowIcon className="w-4 h-4 text-[#576686]/60" />
                                      <span className="truncate">{stManagerName}</span>
                                    </div>

                                    {/* Корзина для удаления студента */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStudent(course._id, studentItem._id)}
                                        title="Удалить студента с курса"
                                        className="size-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>

                                      <button
                                        type="button"
                                        aria-label="Профиль клиента"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (stClient._id) navigate(`/clients/detail?id=${stClient._id}`);
                                        }}
                                        className="size-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-[#576686] active:scale-95 transition-all cursor-pointer"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* 2. Свободные места: Первый слот с кнопкой добавления */}
                              {freeSlotsCount > 0 && (
                                <div
                                  onClick={() => handleOpenAddStudent(course._id)}
                                  className="flex items-center h-14 px-5 rounded-[10px] border-2 border-dashed border-[#576686]/40 bg-white text-[#576686] hover:border-[#2ABAEF] hover:text-[#2ABAEF] hover:bg-[#2ABAEF]/5 transition-all cursor-pointer select-none group"
                                >
                                  <div className="size-6 rounded-md bg-[#576686]/10 group-hover:bg-[#2ABAEF]/20 flex items-center justify-center mr-3 transition-colors">
                                    <Plus className="w-4 h-4 text-[#576686] group-hover:text-[#2ABAEF]" />
                                  </div>
                                  <span className="text-[15px] font-medium">Записать клиента на этот курс</span>
                                </div>
                              )}

                              {/* 3. Остальные пустые слоты (по макету с черными рамками) */}
                              {freeSlotsCount > 1 &&
                                Array.from({ length: freeSlotsCount - 1 }).map((_, slotIdx) => (
                                  <div
                                    key={`empty-slot-${slotIdx}`}
                                    onClick={() => handleOpenAddStudent(course._id)}
                                    className="flex items-center h-14 px-5 rounded-[10px] border border-dashed border-gray-300 bg-white/50 text-gray-400 hover:border-[#2ABAEF] hover:text-[#2ABAEF] hover:bg-[#2ABAEF]/5 transition-all cursor-pointer select-none"
                                  >
                                    <span className="text-xs">Свободное место ({studentsList.length + slotIdx + 2}/{maxStudents})</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                    <p className="text-base font-medium">Событий в графике пока нет</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === "calendar" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[70px] gap-y-12 animate-fadeIn">
                {monthNames.map((monthName, monthIndex) => {
                  const { daysInMonth, startOffset, highlightedMap } = getMonthCalendar(monthIndex);

                  return (
                    <div key={monthName} className="w-[288px] flex flex-col">
                      <h3 className="text-base font-bold text-[#576686] mb-3">
                        {monthName}
                      </h3>

                      <div className="grid grid-cols-7 gap-[5px] mb-2">
                        {weekDays.map((d) => (
                          <div
                            key={d}
                            className="size-9 bg-white/50 rounded-sm flex items-center justify-center text-xs text-[#576686]/50 select-none font-medium"
                          >
                            {d}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-[5px]">
                        {Array.from({ length: startOffset }).map((_, i) => (
                          <div key={`empty-${i}`} className="size-9" />
                        ))}

                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const highlight = highlightedMap[day];

                          return (
                            <div
                              key={day}
                              className={`size-9 flex items-center justify-center text-xs select-none transition-all duration-150 cursor-pointer ${
                                highlight?.isSingle
                                  ? "bg-[#2ABAEF] text-white rounded-full font-bold shadow-xs hover:bg-[#209ecf]"
                                  : highlight?.isRange
                                  ? `bg-[#2ABAEF] text-white font-bold hover:bg-[#209ecf] ${
                                      highlight.isStart ? "rounded-l-full" : highlight.isEnd ? "rounded-r-full" : "rounded-none"
                                    }`
                                  : "bg-white text-[#576686] rounded-sm hover:bg-slate-100"
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка: Запись клиента на курс */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[500px] rounded-[10px] bg-[#F5F7FA] p-8 shadow-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white text-[#576686] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <X className="size-4" />
            </button>

            <h2 className="text-[18px] font-bold text-[#576686] mb-6">
              Записать клиента на курс
            </h2>

            <form onSubmit={handleAddStudentSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium">Поиск и выбор клиента</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Поиск по имени..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="w-full h-11 bg-white rounded-md border border-[#576686]/20 pl-3 pr-9 text-sm text-[#576686] outline-none focus:border-[#2ABAEF]"
                  />
                  <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#576686]/40 pointer-events-none" />
                </div>

                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-11 bg-white rounded-md border border-[#576686]/20 px-3 text-sm text-[#576686] outline-none focus:border-[#2ABAEF] cursor-pointer"
                >
                  {filteredModalClients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city || "Город не указан"})
                    </option>
                  ))}
                  {filteredModalClients.length === 0 && (
                    <option value="">Клиенты не найдены</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-5 h-11 rounded-md bg-white text-[#576686] text-sm border border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingStudent || !selectedClientId}
                  className="px-6 h-11 rounded-md bg-[#576686] text-white text-sm font-medium hover:bg-[#475470] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingStudent ? "Запись..." : "Записать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}