import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronDown, 
  MoreVertical, 
  Plus, 
  Check, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  X,
  Heart,
  User,
  Trash2,
  Search,
  GraduationCap,
  UserCheck
} from "lucide-react";
import { clientsApi, tasksApi, settingsApi, scheduleApi, managersApi } from "../../api/services";

function BackArrowIcon() {
  return (
    <div className="size-[30px] bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95 transition-all duration-150 shadow-xs">
      <svg className="w-4 h-4 text-[#576686]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function MaxLogoIcon({ className = "w-4 h-4 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 9.15573 2.85686 10.228 3.46824 11.1147L2.6 13.4L5.00844 12.636C5.8679 13.1813 6.89704 13.5 8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5ZM5.2 8C5.2 6.4536 6.4536 5.2 8 5.2C9.5464 5.2 10.8 6.4536 10.8 8C10.8 9.5464 9.5464 10.8 8 10.8C6.4536 10.8 5.2 9.5464 5.2 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EditHeaderCircleIcon() {
  return (
    <div className="size-[30px] bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white active:scale-95 transition-all duration-150 cursor-pointer shadow-xs">
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 11.3333V14H4.66667L12.5267 6.14L9.86 3.47333L2 11.3333ZM13.8867 4.78C14.0372 4.62947 14.1217 4.42525 14.1217 4.21233C14.1217 3.99941 14.0372 3.7952 13.8867 3.64467L12.3553 2.11333C12.2048 1.96282 12.0006 1.8783 11.7877 1.8783C11.5748 1.8783 11.3705 1.96282 11.22 2.11333L10.5333 2.8L13.2 5.46667L13.8867 4.78Z" fill="currentColor"/>
      </svg>
    </div>
  );
}

function NoteAddIcon({ className = "w-4 h-4 text-[#576686]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5H10.5M5.5 8H10.5M5.5 10.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
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

function SaveFloppyIcon({ className = "w-4 h-4 text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H11L14 5V13C14 13.5523 13.5523 14 13 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 14V9.5H5V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 2V5H10V2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const formatTime = (dateStr?: string | Date) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const parsePostponeDate = (dateStr: string): Date => {
  try {
    const clean = dateStr.replace(/[\/\s]+/g, " ").trim();
    const parts = clean.split(" ");
    const timePart = parts.find((p) => p.includes(":")) || "14:28";
    const datePart = parts.find((p) => p.includes(".")) || "16.07.2026";
    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  } catch {
    return new Date();
  }
};

export default function ClientClientDetail() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientIdParam = searchParams.get("id");

  const [client, setClient] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Модальные окна
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isPostponeTaskOpen, setIsPostponeTaskOpen] = useState(false);
  const [isCompleteTaskOpen, setIsCompleteTaskOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);

  // Модалка передачи клиента
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [managersList, setManagersList] = useState<any[]>([]);
  const [selectedNewManagerId, setSelectedNewManagerId] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [postponeDate, setPostponeDate] = useState("14:28  /  16.07.2026");
  const [postponeReason, setPostponeReason] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [tags, setTags] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "tasks" | "notes" | "courses">("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const [clientsList, settingsData, allEvents, managers] = await Promise.all([
        clientsApi.getAll(),
        settingsApi.getAll("tag").catch(() => []),
        scheduleApi.getAll().catch(() => []),
        managersApi.getAll().catch(() => []),
      ]);

      setAllClients(clientsList);
      setManagersList(managers.filter((m: any) => m.isActive !== false));

      if (settingsData && settingsData.length > 0) {
        setAvailableTags(settingsData.map((item: any) => item.name));
      }

      let targetId = clientIdParam;
      if (!targetId && clientsList.length > 0) {
        targetId = clientsList[0]._id;
      }

      if (targetId) {
        const details = await clientsApi.getById(targetId);
        setClient(details.client);
        setTasks(details.tasks || []);
        setNotes(details.notes || []);
        setTags(details.client?.tags || []);
        if (details.client?.employees?.length > 0) {
          setSelectedEmployee(details.client.employees[0].name);
        }

        const passed = allEvents
          .filter((ev: any) =>
            ev.isArchived &&
            (ev.students || []).some((s: any) => (s.client?._id || s.client) === targetId)
          )
          .map((ev: any) => ({
            _id: ev._id,
            title: ev.title,
            dates: ev.startDate === ev.endDate || !ev.endDate ? ev.startDate : `${ev.startDate} - ${ev.endDate}`,
            location: ev.location,
          }));

        setCompletedCourses(passed);
      }
    } catch (err) {
      console.error("Ошибка загрузки данных клиента:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [clientIdParam]);

  const removeTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    if (client?._id) {
      try {
        await clientsApi.update(client._id, { tags: updatedTags });
      } catch (err) {
        console.error("Ошибка обновления тегов:", err);
      }
    }
  };

  const handleAddTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagToAdd = newTagInput.trim();
    if (!tagToAdd || tags.includes(tagToAdd) || !client?._id) return;

    const updatedTags = [...tags, tagToAdd];
    setTags(updatedTags);
    setNewTagInput("");
    setIsAddTagOpen(false);

    try {
      await clientsApi.update(client._id, { tags: updatedTags });
    } catch (err) {
      console.error("Ошибка сохранения тега:", err);
    }
  };

  const handleToggleStatus = async () => {
    if (!client?._id) return;
    const newStatus = client.status === "Лид" ? "Покупатель" : "Лид";
    setClient((prev: any) => ({ ...prev, status: newStatus }));
    try {
      await clientsApi.update(client._id, { status: newStatus });
    } catch (err) {
      console.error("Ошибка обновления статуса:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !client?._id) return;
    try {
      const newNote = await clientsApi.addNote(client._id, noteText);
      setNotes((prev) => [newNote, ...prev]);
      setNoteText("");
      setIsAddNoteOpen(false);
    } catch (err) {
      console.error("Ошибка сохранения заметки:", err);
    }
  };

  const handleSavePostpone = async () => {
    if (!selectedTask?._id) return;
    try {
      await tasksApi.postpone(selectedTask._id, {
        endDate: parsePostponeDate(postponeDate).toISOString(),
        postponeReason,
      });
      setIsPostponeTaskOpen(false);
      setSelectedTask(null);
      setPostponeReason("");
      loadClientData();
    } catch (err) {
      console.error("Ошибка переноса задачи:", err);
    }
  };

  const handleConfirmComplete = async () => {
    if (!selectedTask?._id) return;
    try {
      await tasksApi.complete(selectedTask._id);
      setIsCompleteTaskOpen(false);
      setSelectedTask(null);
      loadClientData();
    } catch (err) {
      console.error("Ошибка завершения задачи:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      loadClientData();
    } catch (err) {
      console.error("Ошибка удаления задачи:", err);
    }
  };

  // Передача клиента другому менеджеру
  const handleOpenTransferModal = () => {
    const currentMgrId = client?.manager?._id || client?.manager;
    const firstOtherMgr = managersList.find((m) => m._id !== currentMgrId);
    setSelectedNewManagerId(firstOtherMgr ? firstOtherMgr._id : "");
    setIsTransferModalOpen(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?._id || !selectedNewManagerId) return;

    try {
      setIsTransferring(true);
      await clientsApi.transfer(client._id, selectedNewManagerId);
      setIsTransferModalOpen(false);
      // У текущего менеджера клиент исчезает, возвращаем на страницу клиентов
      navigate("/client/clients");
    } catch (err) {
      console.error("Ошибка при передаче клиента:", err);
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedDateFilter) {
      const startIso = t.startDate ? new Date(t.startDate).toISOString().slice(0, 10) : "";
      const endIso = t.endDate ? new Date(t.endDate).toISOString().slice(0, 10) : "";
      if (startIso !== selectedDateFilter && endIso !== selectedDateFilter) {
        return false;
      }
    }
    return true;
  });

  const filteredNotes = notes.filter((n) =>
    searchQuery ? n.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const clientType = client?.type || "individual";
  const clientName = client?.name || "Клиент";
  const clientStatus = client?.status || "Лид";
  const clientSub = client?.city ? `г. ${client.city} / ${client.activity || ""}` : client?.activity || "Клиент";
  const clientEmail = client?.email || "Не указан";
  const clientPhone = client?.phone || "Не указан";
  const currentManagerName = client?.manager?.name || "Текущий менеджер";

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] relative selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Шапка клиента */}
        <div className="relative w-full min-h-[82px] bg-[#576686] rounded-[10px] px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10 shadow-xs">
          <div className="flex items-center gap-4">
            <div onClick={() => navigate("/client/clients")}>
              <BackArrowIcon />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="text-white text-[18px] font-bold">
                  {clientName}
                </span>

                <div 
                  onClick={handleToggleStatus}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs cursor-pointer select-none transition-colors ${
                    clientStatus === "Лид" ? "bg-sky-400 hover:bg-sky-500" : "bg-sky-500 hover:bg-sky-600"
                  }`}
                >
                  <span>{clientStatus}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>

                {clientType === "company" && selectedEmployee && (
                  <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-white/20 text-white text-sm font-medium">
                    <span>{selectedEmployee}</span>
                  </div>
                )}
              </div>

              <div className="text-white/80 text-xs mt-0.5">
                {clientSub}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors cursor-pointer">
              <MaxLogoIcon className="w-4 h-4 text-white" />
              <span className="text-xs font-bold tracking-wide">МАКС</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors cursor-pointer">
              <Mail className="w-4 h-4 opacity-80" />
              <span className="text-xs">{clientEmail}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors cursor-pointer">
              <Phone className="w-4 h-4 opacity-80" />
              <span className="text-xs">{clientPhone}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              aria-label="Избранное"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 opacity-90 hover:fill-white transition-all" />
              <ChevronDown className="w-3.5 h-3.5 opacity-90" />
            </button>

            <div onClick={() => navigate(`/client/clients/add?id=${client?._id || clientIdParam || ""}`)}>
              <EditHeaderCircleIcon />
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[838px] mt-[30px] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeFilter === "all"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  Все
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("tasks")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeFilter === "tasks"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  Задачи
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("notes")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeFilter === "notes"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  Заметки
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("courses")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    activeFilter === "courses"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Пройденные курсы</span>
                  {completedCourses.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-[#2ABAEF] text-white font-bold">
                      {completedCourses.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-[#576686] ml-4 bg-white px-3.5 py-2.5 rounded-md border border-gray-200 shadow-xs">
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
              </div>

              {/* Поиск и действия: Передать клиента (левее) + Добавить заметку + Создать задачу */}
              <div className="flex items-center gap-3">
                <div className="relative w-64 h-12 group">
                  <input
                    type="search"
                    placeholder="Искать на странице"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full rounded-md border border-[#576686]/20 bg-white pl-4 pr-10 text-xs text-[#576686] placeholder:text-[#576686]/50 outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15"
                  />
                  <Search className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#2ABAEF]" />
                </div>

                <button
                  type="button"
                  onClick={handleOpenTransferModal}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-sky-50 hover:border-[#2ABAEF]/50 hover:text-[#2ABAEF] border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium shadow-xs"
                  title="Передать клиента другому менеджеру"
                >
                  <UserCheck className="w-4 h-4 text-[#2ABAEF]" />
                  <span>Передать клиента</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer font-normal"
                >
                  <NoteAddIcon className="w-4 h-4 text-[#576686]" />
                  <span>Добавить заметку</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/client/create-task?clientId=${client?._id || clientIdParam || ""}`)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-normal"
                >
                  <CreateTaskDocIcon className="w-4 h-4 text-white" />
                  <span>Создать задачу</span>
                </button>
              </div>
            </div>

            {/* Теги клиента */}
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-[#576686] border border-[#576686]/20 bg-transparent hover:border-[#576686]/50 transition-colors"
                >
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)} 
                    className="text-[#576686]/60 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setIsAddTagOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#2ABAEF] border border-[#2ABAEF]/40 hover:bg-[#2ABAEF]/10 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить тег</span>
              </button>
            </div>

            {/* Контент таба «Пройденные курсы» */}
            {activeFilter === "courses" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                {completedCourses.length > 0 ? (
                  completedCourses.map((c) => (
                    <div
                      key={c._id}
                      className="p-6 bg-white rounded-[10px] border border-gray-100 shadow-xs flex items-center justify-between hover:border-[#2ABAEF]/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-[17px] font-bold text-[#576686]">{c.title}</h4>
                          <p className="text-xs text-[#576686]/60 mt-0.5">Город: {c.location || "Чебоксары"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-[#F5F7FA] px-4 py-2 rounded-md text-xs font-medium text-[#576686]">
                        <Calendar className="w-4 h-4 text-[#2ABAEF]" />
                        <span>Дата прохождения: <b>{c.dates}</b></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60 bg-white rounded-[10px] border border-gray-100">
                    <GraduationCap className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-base font-medium">Клиент пока не завершил ни одного обучающего курса</p>
                  </div>
                )}
              </div>
            )}

            {/* Таймлайн с задачами и заметками */}
            {activeFilter !== "courses" && (
              <div className="relative pl-24">
                <div className="absolute left-[78px] top-4 bottom-4 w-px bg-[#576686]" />

                {/* Задачи клиента */}
                {(activeFilter === "all" || activeFilter === "tasks") && filteredTasks.map((task) => (
                  <div key={task._id} className="relative mb-10">
                    <div className="absolute -left-24 top-0 text-right text-xs text-[#576686]">
                      <div className="font-bold">{formatTime(task.startDate)}</div>
                      <div className="text-[11px] opacity-80">{formatDate(task.startDate)}</div>
                    </div>

                    <div className="absolute -left-[38px] top-0 size-11 bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                      <Phone className="w-5 h-5" />
                    </div>

                    <div className="bg-white rounded-[10px] p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-150 ml-6 relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 bg-stone-400 text-white rounded-full text-xs">
                            {task.status === "completed" ? "Выполнено" : "в работе"}
                          </span>
                          <span className="text-xs text-[#576686]">
                            {formatTime(task.startDate)} / {formatDate(task.startDate)}
                          </span>
                          <span className="text-xs text-stone-400">
                            {task.endDate ? `до ${formatTime(task.endDate)} / ${formatDate(task.endDate)}` : ""}
                          </span>
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuTaskId(activeMenuTaskId === task._id ? null : task._id)}
                            className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-[#576686] hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuTaskId === task._id && (
                            <div className="absolute right-0 top-9 z-30 w-44 rounded-md bg-white p-1.5 shadow-xl border border-gray-100 flex flex-col gap-1 animate-fadeIn">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  setSelectedTask(task);
                                  setIsCompleteTaskOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-[#576686] hover:bg-[#F5F7FA] rounded-sm transition-colors text-left cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Завершить</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  setSelectedTask(task);
                                  setIsPostponeTaskOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-[#576686] hover:bg-[#F5F7FA] rounded-sm transition-colors text-left cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Отложить</span>
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
                      </div>

                      <h3 className="text-[18px] font-bold text-[#576686] mb-3">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-base text-[#576686] leading-relaxed mb-6">
                          {task.description}
                        </p>
                      )}

                      {task.status !== "completed" && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsPostponeTaskOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-[10px] bg-[#F5F7FA] text-[#576686] text-sm hover:bg-slate-200 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Отложить задачу</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsCompleteTaskOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-[10px] bg-[#576686] text-white text-sm hover:bg-[#475470] hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Завершить задачу</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Заметки клиента */}
                {(activeFilter === "all" || activeFilter === "notes") && filteredNotes.map((note) => (
                  <div key={note._id} className="relative mb-10">
                    <div className="absolute -left-24 top-0 text-right text-xs text-[#576686]">
                      <div className="font-bold">{formatTime(note.createdAt)}</div>
                      <div className="text-[11px] opacity-80">{formatDate(note.createdAt)}</div>
                    </div>

                    <div className="absolute -left-[38px] top-0 size-11 bg-[#576686] rounded-full flex items-center justify-center text-white shadow-sm z-10">
                      <NoteAddIcon className="w-5 h-5 text-white" />
                    </div>

                    <div className="bg-[#F5F7FA] rounded-[10px] p-7 border border-[#576686]/20 ml-6 text-base text-[#576686] leading-relaxed shadow-xs hover:border-[#576686]/50 transition-colors">
                      {note.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка: Передать клиента другому менеджеру */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[500px] rounded-[10px] bg-[#F5F7FA] p-8 shadow-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white text-[#576686] hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              <X className="size-4" />
            </button>

            <h2 className="text-[18px] font-bold text-[#576686] mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#2ABAEF]" />
              <span>Передать клиента</span>
            </h2>
            <p className="text-xs text-[#576686]/70 mb-6">
              Клиент <b>{clientName}</b> будет передан выбранному менеджеру и удалится из вашего кабинета.
            </p>

            <form onSubmit={handleTransferSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium">Выберите нового менеджера</label>
                <div className="relative w-full">
                  <select
                    required
                    value={selectedNewManagerId}
                    onChange={(e) => setSelectedNewManagerId(e.target.value)}
                    className="w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 pr-10 text-base text-[#576686] outline-none appearance-none cursor-pointer focus:border-[#2ABAEF]"
                  >
                    <option value="">-- Выберите менеджера --</option>
                    {managersList.map((m) => {
                      const isCurrent = m._id === (client?.manager?._id || client?.manager);
                      return (
                        <option key={m._id} value={m._id} disabled={isCurrent}>
                          {m.name} {isCurrent ? `(Вы / ${currentManagerName})` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#576686]/50" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-5 h-11 rounded-[10px] bg-white text-[#576686] text-sm border border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isTransferring || !selectedNewManagerId}
                  className="px-6 h-11 rounded-[10px] bg-[#576686] text-white text-sm font-medium hover:bg-[#475470] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isTransferring ? "Передача..." : "Передать"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка: Добавление нового тега */}
      {isAddTagOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[480px] rounded-[10px] bg-[#F5F7FA] p-[30px] shadow-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setIsAddTagOpen(false)}
              className="absolute right-[20px] top-[20px] flex size-8 items-center justify-center rounded-full bg-white text-[#576686] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <form onSubmit={handleAddTagSubmit} className="flex flex-col gap-5">
              <h2 className="text-[18px] font-bold text-[#576686]">
                Добавление тега
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium">
                  Название тега
                </label>
                <input
                  type="text"
                  required
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Введите тег или выберите ниже"
                  className="w-full h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-sm text-[#576686] outline-none focus:border-[#2ABAEF] focus:ring-3 focus:ring-[#2ABAEF]/15"
                />
              </div>

              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewTagInput(tag)}
                      className="px-2.5 py-1 rounded-full text-xs bg-white text-[#576686] border border-gray-200 hover:border-[#2ABAEF] hover:text-[#2ABAEF] transition-all cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddTagOpen(false)}
                  className="px-5 py-3 rounded-[10px] bg-white text-[#576686] border border-gray-200 text-sm hover:bg-slate-100 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-[10px] bg-[#576686] text-white text-sm hover:bg-[#475470] cursor-pointer"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка: Избранное */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[384px] h-[495px] rounded-[10px] bg-[#F5F7FA] p-[15px] shadow-2xl border border-gray-200 flex flex-col justify-between">
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(false)}
              className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-white/50 text-[#576686] hover:bg-white active:scale-95 transition-all cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col gap-2 overflow-y-auto pr-2 relative max-h-full">
              {allClients.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setSearchParams({ id: item._id });
                    setIsFavoritesOpen(false);
                  }}
                  className={`p-5 rounded-md flex items-start gap-2.5 cursor-pointer transition-all duration-150 ${
                    item._id === client?._id ? "bg-white shadow-sm border border-gray-100" : "bg-[#F5F7FA] hover:bg-white/80"
                  }`}
                >
                  <div className="size-4 shrink-0 mt-0.5 text-[#576686]">
                    <User className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[16px] font-bold text-[#576686] leading-tight truncate">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-[#576686]">
                      {item.city ? `г. ${item.city} / ${item.activity}` : item.activity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-2 top-[30px] w-1 h-20 bg-[#576686] rounded-full pointer-events-none" />
          </div>
        </div>
      )}

      {/* Модалка: Заметка */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[600px] h-[515px] rounded-[10px] bg-[#F5F7FA] p-[30px] shadow-2xl border border-gray-200 flex flex-col justify-between">
            <button
              type="button"
              onClick={() => setIsAddNoteOpen(false)}
              className="absolute right-[30px] top-[30px] flex size-11 items-center justify-center rounded-full bg-white/50 text-[#576686] hover:bg-white active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div>
              <h2 className="text-[18px] font-bold text-[#576686] mb-6">
                Добавление заметки
              </h2>

              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Текст заметки
                </label>
                <textarea
                  rows={8}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Текст"
                  className="w-full h-72 rounded-md border border-[rgba(87,102,134,0.2)] bg-white p-4 text-base text-[#576686] outline-none resize-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => setIsAddNoteOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Отмена</span>
              </button>

              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-6 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium"
              >
                <SaveFloppyIcon className="w-4 h-4 text-white" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: Отложить задачу */}
      {isPostponeTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[600px] h-[496px] rounded-[10px] bg-[#F5F7FA] p-[30px] shadow-2xl border border-gray-200 flex flex-col justify-between">
            <button
              type="button"
              onClick={() => setIsPostponeTaskOpen(false)}
              className="absolute right-[30px] top-[30px] flex size-11 items-center justify-center rounded-full bg-white/50 text-[#576686] hover:bg-white active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex flex-col gap-[18px]">
              <h2 className="text-[18px] font-bold text-[#576686]">
                Отложить задачу
              </h2>

              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Дата переноса
                </label>
                <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[rgba(87,102,134,0.2)] px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                  <input
                    type="text"
                    value={postponeDate}
                    onChange={(e) => setPostponeDate(e.target.value)}
                    className="w-full bg-transparent text-base text-[#576686] outline-none"
                  />
                  <Calendar className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#576686]/60 group-focus-within:text-[#2ABAEF] transition-colors" />
                </div>
              </div>

              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Причина изменения
                </label>
                <textarea
                  rows={4}
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="Причина изменения"
                  className="w-full h-36 rounded-md border border-[rgba(87,102,134,0.2)] bg-white p-4 text-base text-[#576686] outline-none resize-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setIsPostponeTaskOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Отмена</span>
              </button>

              <button
                type="button"
                onClick={handleSavePostpone}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-6 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium"
              >
                <SaveFloppyIcon className="w-4 h-4 text-white" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: Завершение задачи */}
      {isCompleteTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[600px] h-[458px] rounded-[10px] bg-[#F5F7FA] p-[30px] shadow-2xl border border-gray-200 flex flex-col justify-between">
            <button
              type="button"
              onClick={() => setIsCompleteTaskOpen(false)}
              className="absolute right-[30px] top-[30px] flex size-11 items-center justify-center rounded-full bg-white/50 text-[#576686] hover:bg-white active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div>
              <h2 className="text-[18px] font-bold text-[#576686] mb-4">
                Завершение задачи
              </h2>

              <p className="text-base text-[#576686] leading-relaxed">
                Перед завершением задачи проверьте, нужен ли следующий шаг.
                <br /><br />
                Если работа по клиенту продолжается, выберите «Завершить и создать новую задачу» — так вы сразу запланируете дальнейшее действие и не потеряете контакт.
                <br /><br />
                Если дополнительных действий не требуется, нажмите «Завершить задачу».
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  await handleConfirmComplete();
                  navigate(`/client/create-task?clientId=${client?._id || clientIdParam || ""}`);
                }}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] py-4 px-5 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <CreateTaskDocIcon className="w-4 h-4 text-white" />
                <span>Завершить и создать новую задачу</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmComplete}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] py-4 px-5 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Завершить задачу</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}