import React, { useState, useEffect, FormEvent } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tasksApi, clientsApi, managersApi } from "../api/services";

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

// Форматирование текущей даты для datetime-local (YYYY-MM-DDTHH:mm)
const getInitialDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function CreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdParam = searchParams.get("clientId");
  const managerIdParam = searchParams.get("managerId");

  const [startDate, setStartDate] = useState(getInitialDateTime());
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [taskType, setTaskType] = useState("Звонок");
  const [title, setTitle] = useState(
    "Связаться с клиентом для уточнения информации"
  );
  const [description, setDescription] = useState("");

  const [managersList, setManagersList] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [managers, clients] = await Promise.all([
          managersApi.getAll(),
          clientsApi.getAll(),
        ]);
        setManagersList(managers);
        setClientsList(clients);

        if (managerIdParam) {
          setSelectedManagerId(managerIdParam);
        } else if (managers.length > 0) {
          setSelectedManagerId(managers[0]._id);
        }

        if (clientIdParam) {
          const targetClient = clients.find((c: any) => c._id === clientIdParam);
          if (targetClient) {
            setSelectedClientId(targetClient._id);
            setClientSearch(targetClient.name);
            if (targetClient.manager) {
              setSelectedManagerId(targetClient.manager._id || targetClient.manager);
            }
          }
        } else if (clients.length > 0) {
          setSelectedClientId(clients[0]._id);
          setClientSearch(clients[0].name);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных формы задачи:", err);
      }
    };
    fetchInitialData();
  }, [clientIdParam, managerIdParam]);

  const filteredClients = clientsList.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedClientId) {
      setError("Пожалуйста, выберите клиента из списка");
      return;
    }

    setIsLoading(true);

    try {
      const parsedDate = new Date(startDate);
      await tasksApi.create({
        title: title.trim(),
        description: description.trim(),
        client: selectedClientId,
        manager: selectedManagerId || undefined,
        type: taskType,
        startDate: parsedDate,
        endDate: parsedDate,
        status: "in_work",
      });

      navigate(-1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при сохранении задачи");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs">
          <h1 className="mb-8 text-[18px] font-bold text-[#576686]">
            Добавление задачи
          </h1>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-6">
              {/* 1. Дата начала (со встроенным календарем) */}
              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Дата и время
                </label>
                <div className="relative flex items-center w-full h-[52px] bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-base text-[#576686] outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Менеджер */}
              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Менеджер
                </label>
                <div className="relative flex items-center w-full h-[52px] bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                  >
                    {managersList.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                    {managersList.length === 0 && (
                      <option value="">Нет доступных менеджеров</option>
                    )}
                  </select>
                  <ChevronDown className="h-4 w-4 text-[#576686]/50 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors duration-200 absolute right-4 pointer-events-none" />
                </div>
              </div>

              {/* 3. Клиент */}
              <div className="group flex flex-col gap-2 relative">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Клиент
                </label>
                <div className="relative flex items-center w-full h-[52px] bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                  <input
                    type="text"
                    value={clientSearch}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setIsClientDropdownOpen(true);
                    }}
                    placeholder="Поиск клиента..."
                    className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                  />
                  <Search className="h-4 w-4 text-[#576686]/50 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors duration-200 shrink-0 pointer-events-none" />
                </div>

                {isClientDropdownOpen && filteredClients.length > 0 && (
                  <div className="absolute top-[78px] left-0 z-30 w-full rounded-md bg-white p-2 shadow-xl border border-gray-100 max-h-48 overflow-y-auto flex flex-col gap-1 animate-fadeIn">
                    {filteredClients.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setSelectedClientId(c._id);
                          setClientSearch(c.name);
                          if (c.manager) {
                            setSelectedManagerId(c.manager._id || c.manager);
                          }
                          setIsClientDropdownOpen(false);
                        }}
                        className="px-3 py-2 text-sm text-[#576686] hover:bg-[#F5F7FA] rounded-md cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-[#576686]/60">{c.city}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Тип задачи */}
              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Тип задачи
                </label>
                <div className="relative flex items-center w-full h-[52px] bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                  >
                    <option value="Звонок">Звонок</option>
                    <option value="Встреча">Встреча</option>
                    <option value="Отправить КП">Отправить КП</option>
                    <option value="Оплата">Оплата</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-[#576686]/50 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors duration-200 absolute right-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Название задачи */}
            <div className="group flex flex-col gap-2">
              <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                Название задачи
              </label>
              <div className="relative flex items-center w-full h-[52px] bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название задачи"
                  className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                />
              </div>
            </div>

            {/* Описание задачи */}
            <div className="group flex flex-col gap-2">
              <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                Описание задачи
              </label>
              <div className="w-full bg-white rounded-md border border-[#576686]/20 p-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание"
                  rows={4}
                  className="w-full bg-transparent text-base text-[#576686] outline-none resize-none placeholder:text-[#576686]/40"
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className="mt-4 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-white px-6 text-base text-[#576686] border border-gray-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Отмена</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[52px] items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-6 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer disabled:opacity-60"
              >
                <SaveFloppyIcon className="w-4 h-4 text-white" />
                <span>{isLoading ? "Сохранение..." : "Сохранить"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}