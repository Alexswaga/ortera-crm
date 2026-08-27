import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, Plus, Copy, X, Ban } from "lucide-react";
import { clientsApi } from "../../api/services";
import { formatCapitalizeWords, formatCapitalizeFirst, formatPhone, formatINN } from "../../utils/formatters";

function ManagerIcon() {
  return (
    <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.0026 8.14667C14.0026 4.48667 11.1626 2 8.0026 2C4.87594 2 2.0026 4.43333 2.0026 8.18667C1.6026 8.41333 1.33594 8.84 1.33594 9.33333V10.6667C1.33594 11.4 1.93594 12 2.66927 12H3.33594V7.93333C3.33594 5.35333 5.4226 3.26667 8.0026 3.26667C10.5826 3.26667 12.6693 5.35333 12.6693 7.93333V12.6667H7.33594V14H12.6693C13.4026 14 14.0026 13.4 14.0026 12.6667V11.8533C14.3959 11.6467 14.6693 11.24 14.6693 10.76V9.22667C14.6693 8.76 14.3959 8.35333 14.0026 8.14667Z" fill="currentColor" />
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

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

export default function ClientAddClient() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("id");
  const isEditing = Boolean(clientId);

  const [clientType, setClientType] = useState<"individual" | "company">("individual");
  const [isCeased, setIsCeased] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isMessengerModalOpen, setIsMessengerModalOpen] = useState(false);
  const [messengersList, setMessengersList] = useState<any[]>([
    { messenger: "МАКС", type: "Ссылка", url: "https://max.ru/" },
  ]);

  const [messengerForm, setMessengerForm] = useState({
    messenger: "Телеграм",
    type: "Ссылка",
    url: "https://t.me/username",
  });

  const [allExistingClients, setAllExistingClients] = useState<any[]>([]);

  const [duplicateState, setDuplicateState] = useState<{
    phoneMatch: boolean;
    emailMatch: boolean;
    innMatch: boolean;
    managerName: string;
    showTooltip: boolean;
  }>({
    phoneMatch: false,
    emailMatch: false,
    innMatch: false,
    managerName: "",
    showTooltip: false,
  });

  const [formData, setFormData] = useState({
    inn: "7709359770",
    orgName: "Стелька Про",
    fullName: "Николаев Дмитрий Александрович",
    activity: "Подолог",
    city: "Чебоксары",
    email: "123@ya.ru",
    phone: "+7 927 668 95 18",
    maxMessenger: "https://max.ru/",
    employeeName: "Игнатьева Светлана",
    employeeRole: "Руководитель",
    employeePhone: "+7 927 668 95 18",
    employeeEmail: "123@ya.ru",
    employeeMessenger: "https://max.ru/usrname4354fgdfd",
  });

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const clientsData = await clientsApi.getAll();
        setAllExistingClients(clientsData);

        if (clientId) {
          setIsLoading(true);
          const data = await clientsApi.getById(clientId);
          const c = data.client;
          if (c) {
            setClientType(c.type || "individual");
            setIsCeased(c.isCeased || false);
            setFormData({
              inn: c.inn || "",
              orgName: c.type === "company" ? c.name : "Стелька Про",
              fullName: c.type === "individual" ? c.name : "Николаев Дмитрий Александрович",
              activity: c.activity || "Подолог",
              city: c.city || "",
              email: c.email || "",
              phone: formatPhone(c.phone || ""),
              maxMessenger: c.messengers?.[0]?.url || "https://max.ru/",
              employeeName: c.employees?.[0]?.name || "",
              employeeRole: c.employees?.[0]?.role || "Руководитель",
              employeePhone: formatPhone(c.employees?.[0]?.phone || ""),
              employeeEmail: c.employees?.[0]?.email || "",
              employeeMessenger: c.employees?.[0]?.messenger || "",
            });
            if (c.messengers && c.messengers.length > 0) {
              setMessengersList(c.messengers);
            }
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки клиентов:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientsData();
  }, [clientId]);

  useEffect(() => {
    if (isEditing || allExistingClients.length === 0) return;

    const cleanPhone = normalizePhone(formData.phone);
    const cleanEmail = formData.email.toLowerCase().trim();
    const cleanInn = formData.inn.trim();

    let matchedManager = "";
    let phoneMatch = false;
    let emailMatch = false;
    let innMatch = false;

    for (const c of allExistingClients) {
      const cPhone = normalizePhone(c.phone || "");
      const cEmail = (c.email || "").toLowerCase().trim();
      const cInn = (c.inn || "").trim();

      const isP = cleanPhone.length >= 7 && cPhone.length >= 7 && (cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone));
      const isE = cleanEmail.length >= 4 && cEmail === cleanEmail;
      const isI = clientType === "company" && cleanInn.length >= 8 && cInn === cleanInn;

      if (isP) phoneMatch = true;
      if (isE) emailMatch = true;
      if (isI) innMatch = true;

      if (isP || isE || isI) {
        matchedManager = c.manager?.name || "Иванова Настя";
      }
    }

    const hasAny = phoneMatch || emailMatch || innMatch;

    setDuplicateState({
      phoneMatch,
      emailMatch,
      innMatch,
      managerName: matchedManager,
      showTooltip: hasAny,
    });
  }, [formData.phone, formData.email, formData.inn, clientType, allExistingClients, isEditing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (duplicateState.phoneMatch || duplicateState.emailMatch || duplicateState.innMatch) {
      setDuplicateState((prev) => ({ ...prev, showTooltip: true }));
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        type: clientType,
        name: clientType === "company" ? formData.orgName.trim() : formData.fullName.trim(),
        activity: formData.activity.trim(),
        city: formData.city.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        isCeased: isCeased,
        isActive: !isCeased,
        status: "Лид",
        tags: ["Постоянный клиент", "Наш студент"],
        messengers: messengersList.map((m) => ({
          messenger: m.messenger,
          type: m.type,
          url: m.url || formData.maxMessenger,
        })),
        employees:
          clientType === "company" && formData.employeeName
            ? [
                {
                  name: formData.employeeName.trim(),
                  role: formData.employeeRole || "Сотрудник",
                  phone: formData.employeePhone.trim(),
                  email: formData.employeeEmail.trim(),
                  messenger: formData.employeeMessenger.trim(),
                },
              ]
            : [],
      };

      if (clientType === "company" && formData.inn) {
        payload.inn = formData.inn.trim();
      }

      if (isEditing && clientId) {
        await clientsApi.update(clientId, payload);
      } else {
        await clientsApi.create(payload);
      }

      navigate("/client/clients");
    } catch (err: any) {
      console.error("Ошибка при сохранении клиента:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMessengerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (messengerForm.url) {
      setMessengersList((prev) => [...prev, { ...messengerForm }]);
    }
    setIsMessengerModalOpen(false);
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] relative selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 shadow-xs flex flex-col justify-between min-h-[674px]">
          
          <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
            <div>
              <h1 className="text-[18px] font-bold text-[#576686] mb-8">
                {isEditing ? "Редактирование клиента" : "Добавление клиента"}
              </h1>

              {clientType === "individual" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-6">
                  
                  {/* 1. Тип */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Тип
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <select
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value as "individual" | "company")}
                        className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="individual">Физическое лицо, ИП без сотрудников</option>
                        <option value="company">Организация, ИП с сотрудниками</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                    </div>
                  </div>

                  {/* 2. ФИО (с заглавной буквы) */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      ФИО
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: formatCapitalizeWords(e.target.value) })}
                        placeholder="Николаев Дмитрий Александрович"
                        className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                      />
                    </div>
                  </div>

                  {/* 3. Деятельность */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Деятельность
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <select
                        value={formData.activity}
                        onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                        className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="Подолог">Подолог</option>
                        <option value="Ортопедическая клиника">Ортопедическая клиника</option>
                        <option value="Врач ЛФК">Врач ЛФК</option>
                        <option value="Травматолог-ортопед">Травматолог-ортопед</option>
                        <option value="Массажист">Массажист</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                    </div>
                  </div>

                  {/* 4. Город */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Город
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: formatCapitalizeWords(e.target.value) })}
                        placeholder="Чебоксары"
                        className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                      />
                    </div>
                  </div>

                  {/* 5. E-mail */}
                  <div className="group flex flex-col gap-2">
                    <label className={`text-xs font-medium transition-colors ${
                      duplicateState.emailMatch ? "text-[#B77C70]" : "text-[#576686] group-focus-within:text-[#2ABAEF]"
                    }`}>
                      E-mail
                    </label>
                    <div className={`relative flex items-center w-full h-12 bg-white rounded-md px-4 transition-all duration-200 ${
                      duplicateState.emailMatch
                        ? "border border-[#B77C70] ring-3 ring-[#B77C70]/15"
                        : "border border-[#576686]/20 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                    }`}>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                        className={`w-full bg-transparent text-base outline-none ${
                          duplicateState.emailMatch ? "text-[#B77C70]" : "text-[#576686] placeholder:text-[#576686]/40"
                        }`}
                      />
                    </div>
                  </div>

                  {/* 6. Телефон физлица */}
                  <div className="group flex flex-col gap-2 relative">
                    <label className={`text-xs font-medium transition-colors ${
                      duplicateState.phoneMatch ? "text-[#B77C70]" : "text-[#576686] group-focus-within:text-[#2ABAEF]"
                    }`}>
                      Телефон
                    </label>
                    <div className={`relative flex items-center w-full h-12 bg-white rounded-md px-4 transition-all duration-200 ${
                      duplicateState.phoneMatch
                        ? "border border-[#B77C70] ring-3 ring-[#B77C70]/15"
                        : "border border-[#576686]/20 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                    }`}>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        placeholder="+7 999 000 00 00"
                        className={`w-full bg-transparent text-base outline-none ${
                          duplicateState.phoneMatch ? "text-[#B77C70]" : "text-[#576686] placeholder:text-[#576686]/40"
                        }`}
                      />
                    </div>

                    {duplicateState.showTooltip && (duplicateState.phoneMatch || duplicateState.emailMatch || duplicateState.innMatch) && (
                      <div className="absolute left-[135px] top-[14px] z-30 w-[245px] rounded-[8px] bg-[#B77C70] p-4 text-white shadow-xl flex flex-col gap-2.5 animate-fadeIn select-none">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-normal leading-snug">
                            Кажется такой Клиент закреплен за менеджером
                          </span>
                          <button
                            type="button"
                            onClick={() => setDuplicateState((prev) => ({ ...prev, showTooltip: false }))}
                            className="shrink-0 opacity-80 hover:opacity-100 cursor-pointer p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/20">
                          <ManagerIcon />
                          <span className="text-xs font-medium">{duplicateState.managerName}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Сетка для Организации */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-6">
                  
                  {/* 1. Тип */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Тип
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <select
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value as "individual" | "company")}
                        className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="company">Организация, ИП с сотрудниками</option>
                        <option value="individual">Физическое лицо, ИП без сотрудников</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                    </div>
                  </div>

                  {/* 2. ИНН (только цифры) */}
                  <div className="group flex flex-col gap-2">
                    <label className={`text-xs font-medium transition-colors ${
                      duplicateState.innMatch ? "text-[#B77C70]" : "text-[#576686] group-focus-within:text-[#2ABAEF]"
                    }`}>
                      ИНН
                    </label>
                    <div className={`relative flex items-center w-full h-12 bg-white rounded-md px-4 transition-all duration-200 ${
                      duplicateState.innMatch
                        ? "border border-[#B77C70] ring-3 ring-[#B77C70]/15"
                        : "border border-[#576686]/20 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                    }`}>
                      <input
                        type="text"
                        value={formData.inn}
                        onChange={(e) => setFormData({ ...formData, inn: formatINN(e.target.value) })}
                        placeholder="7709359770"
                        className={`w-full bg-transparent text-base outline-none ${
                          duplicateState.innMatch ? "text-[#B77C70]" : "text-[#576686] placeholder:text-[#576686]/40"
                        }`}
                      />
                    </div>
                  </div>

                  {/* 3. Название организации */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Название организации
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <input
                        type="text"
                        required
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: formatCapitalizeFirst(e.target.value) })}
                        className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                      />
                    </div>
                  </div>

                  {/* 4. Деятельность */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Деятельность
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <select
                        value={formData.activity}
                        onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                        className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="Ортопедическая клиника">Ортопедическая клиника</option>
                        <option value="Подолог">Подолог</option>
                        <option value="Врач ЛФК">Врач ЛФК</option>
                        <option value="Травматолог-ортопед">Травматолог-ортопед</option>
                        <option value="Массажист">Массажист</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                    </div>
                  </div>

                  {/* 5. Город */}
                  <div className="group flex flex-col gap-2">
                    <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                      Город
                    </label>
                    <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: formatCapitalizeWords(e.target.value) })}
                        className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                      />
                    </div>
                  </div>

                  {/* 6. E-mail */}
                  <div className="group flex flex-col gap-2">
                    <label className={`text-xs font-medium transition-colors ${
                      duplicateState.emailMatch ? "text-[#B77C70]" : "text-[#576686] group-focus-within:text-[#2ABAEF]"
                    }`}>
                      E-mail
                    </label>
                    <div className={`relative flex items-center w-full h-12 bg-white rounded-md px-4 transition-all duration-200 ${
                      duplicateState.emailMatch
                        ? "border border-[#B77C70] ring-3 ring-[#B77C70]/15"
                        : "border border-[#576686]/20 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                    }`}>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                        className={`w-full bg-transparent text-base outline-none ${
                          duplicateState.emailMatch ? "text-[#B77C70]" : "text-[#576686] placeholder:text-[#576686]/40"
                        }`}
                      />
                    </div>
                  </div>

                  {/* 7. Телефон организации */}
                  <div className="group flex flex-col gap-2 relative">
                    <label className={`text-xs font-medium transition-colors ${
                      duplicateState.phoneMatch ? "text-[#B77C70]" : "text-[#576686] group-focus-within:text-[#2ABAEF]"
                    }`}>
                      Телефон
                    </label>
                    <div className={`relative flex items-center w-full h-12 bg-white rounded-md px-4 transition-all duration-200 ${
                      duplicateState.phoneMatch
                        ? "border border-[#B77C70] ring-3 ring-[#B77C70]/15"
                        : "border border-[#576686]/20 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                    }`}>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        placeholder="+7 999 000 00 00"
                        className={`w-full bg-transparent text-base outline-none ${
                          duplicateState.phoneMatch ? "text-[#B77C70]" : "text-[#576686] placeholder:text-[#576686]/40"
                        }`}
                      />
                    </div>

                    {duplicateState.showTooltip && (duplicateState.phoneMatch || duplicateState.emailMatch || duplicateState.innMatch) && (
                      <div className="absolute left-[135px] top-[14px] z-30 w-[245px] rounded-[8px] bg-[#B77C70] p-4 text-white shadow-xl flex flex-col gap-2.5 animate-fadeIn select-none">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-normal leading-snug">
                            Кажется такой Клиент закреплен за менеджером
                          </span>
                          <button
                            type="button"
                            onClick={() => setDuplicateState((prev) => ({ ...prev, showTooltip: false }))}
                            className="shrink-0 opacity-80 hover:opacity-100 cursor-pointer p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/20">
                          <ManagerIcon />
                          <span className="text-xs font-medium">{duplicateState.managerName}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Сотрудники */}
              {clientType === "company" && (
                <div className="mt-10 animate-fadeIn">
                  <h2 className="text-[18px] font-bold text-[#576686] mb-6">
                    Сотрудники
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-6">
                    <div className="group flex flex-col gap-2">
                      <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                        ФИО
                      </label>
                      <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                        <input
                          type="text"
                          value={formData.employeeName}
                          onChange={(e) => setFormData({ ...formData, employeeName: formatCapitalizeWords(e.target.value) })}
                          placeholder="Игнатьева Светлана"
                          className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                        />
                      </div>
                    </div>

                    <div className="group flex flex-col gap-2">
                      <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                        Должность
                      </label>
                      <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                        <select
                          value={formData.employeeRole}
                          onChange={(e) => setFormData({ ...formData, employeeRole: e.target.value })}
                          className="w-full bg-transparent text-xs text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                        >
                          <option value="">Выберите должность</option>
                          <option value="Руководитель">Руководитель</option>
                          <option value="Врач-подолог">Врач-подолог</option>
                          <option value="Администратор">Администратор</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                      </div>
                    </div>

                    <div className="group flex flex-col gap-2">
                      <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                        Телефон
                      </label>
                      <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                        <input
                          type="text"
                          value={formData.employeePhone}
                          onChange={(e) => setFormData({ ...formData, employeePhone: formatPhone(e.target.value) })}
                          placeholder="+7 999 000 00 00"
                          className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                        />
                      </div>
                    </div>

                    <div className="group flex flex-col gap-2">
                      <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                        E-mail
                      </label>
                      <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                        <input
                          type="email"
                          value={formData.employeeEmail}
                          onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value.toLowerCase() })}
                          className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Мессенджер сотрудника */}
                  <div className="mt-6 flex flex-col gap-2 max-w-[705px]">
                    <label className="text-xs text-[#576686] font-medium">МАКС</label>
                    <div className="flex items-center gap-6">
                      <div className="relative flex-1 group">
                        <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 pl-4 pr-12 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                          <input
                            type="text"
                            value={formData.employeeMessenger}
                            onChange={(e) => setFormData({ ...formData, employeeMessenger: e.target.value })}
                            className="w-full bg-transparent text-base text-[#576686] outline-none"
                          />
                          <button type="button" className="absolute right-4 text-[#576686]/60 hover:text-[#2ABAEF] transition-colors cursor-pointer">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div 
                        onClick={() => setIsMessengerModalOpen(true)}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                      >
                        <button 
                          type="button" 
                          className="size-12 rounded-md bg-[#576686] text-white flex items-center justify-center group-hover:bg-[#475470] group-hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <span className="text-base text-[#576686] whitespace-nowrap group-hover:text-[#2ABAEF] transition-colors">
                          Добавить мессенджер
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#576686]/30 my-8" />

                  <div className="flex items-center gap-3 cursor-pointer group w-fit select-none">
                    <button type="button" className="size-12 rounded-md bg-[#576686] text-white flex items-center justify-center group-hover:bg-[#475470] group-hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer">
                      <Plus className="w-5 h-5" />
                    </button>
                    <span className="text-base text-[#576686] font-normal group-hover:text-[#2ABAEF] transition-colors">
                      Добавить сотрудника
                    </span>
                  </div>
                </div>
              )}

              {/* Мессенджеры (для физлица) */}
              {clientType === "individual" && (
                <div className="mt-8">
                  <h2 className="text-[18px] font-bold text-[#576686] mb-6">
                    Мессенджеры
                  </h2>
                  
                  <div className="flex flex-col gap-2 max-w-[705px]">
                    <label className="text-xs text-[#576686] font-medium">МАКС</label>
                    <div className="flex items-center gap-6">
                      <div className="relative flex-1 group">
                        <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 pl-4 pr-12 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                          <input
                            type="text"
                            value={formData.maxMessenger}
                            onChange={(e) => setFormData({ ...formData, maxMessenger: e.target.value })}
                            className="w-full bg-transparent text-base text-[#576686] outline-none"
                          />
                          <button type="button" className="absolute right-4 text-[#576686]/60 hover:text-[#2ABAEF] transition-colors cursor-pointer">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div 
                        onClick={() => setIsMessengerModalOpen(true)}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                      >
                        <button 
                          type="button" 
                          className="size-12 rounded-md bg-[#576686] text-white flex items-center justify-center group-hover:bg-[#475470] group-hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <span className="text-base text-[#576686] whitespace-nowrap group-hover:text-[#2ABAEF] transition-colors">
                          Добавить мессенджер
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Нижние кнопки */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
              {clientType === "individual" ? (
                <button
                  type="button"
                  onClick={() => setIsCeased(!isCeased)}
                  className={`inline-flex items-center justify-center gap-2.5 rounded-[10px] px-5 py-4 text-base transition-all duration-150 cursor-pointer border ${
                    isCeased 
                      ? "bg-stone-200 text-stone-600 border-stone-300"
                      : "bg-white text-stone-400 border-gray-200 hover:border-stone-400 hover:text-stone-600"
                  }`}
                >
                  <Ban className="w-4 h-4 text-stone-400" />
                  <span>Прекратил деятельность</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-4 ml-auto">
                <button
                  type="button"
                  onClick={() => navigate("/client/clients")}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Отмена</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-6 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium disabled:opacity-60"
                >
                  <SaveFloppyIcon className="w-4 h-4 text-white" />
                  <span>{isLoading ? "Сохранение..." : "Сохранить"}</span>
                </button>
              </div>

            </div>

          </form>

        </div>

      </div>

      {isMessengerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#576686]/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-[600px] rounded-[10px] bg-[#F5F7FA] p-[30px] shadow-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setIsMessengerModalOpen(false)}
              className="absolute right-[30px] top-[30px] flex size-11 items-center justify-center rounded-full bg-white/50 text-[#576686] hover:bg-white active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <form onSubmit={handleAddMessengerSubmit} className="flex flex-col gap-6">
              <h2 className="text-[18px] font-bold text-[#576686]">
                Добавление мессенджера
              </h2>

              <div className="flex flex-col gap-[18px]">
                <div className="group flex flex-col gap-2">
                  <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                    Выберите мессенджер
                  </label>
                  <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                    <select
                      value={messengerForm.messenger}
                      onChange={(e) => setMessengerForm({ ...messengerForm, messenger: e.target.value })}
                      className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                    >
                      <option value="Телеграм">Телеграм</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="ВКонтакте">ВКонтакте</option>
                      <option value="МАКС">МАКС</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                  </div>
                </div>

                <div className="group flex flex-col gap-2">
                  <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                    Тип
                  </label>
                  <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                    <select
                      value={messengerForm.type}
                      onChange={(e) => setMessengerForm({ ...messengerForm, type: e.target.value })}
                      className="w-full bg-transparent text-base text-[#576686] outline-none appearance-none cursor-pointer pr-6"
                    >
                      <option value="Ссылка">Ссылка</option>
                      <option value="Номер телефона">Номер телефона</option>
                      <option value="Юзернейм">Юзернейм</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#576686]/60 group-hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors" />
                  </div>
                </div>

                <div className="group flex flex-col gap-2">
                  <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                    Ссылка
                  </label>
                  <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                    <input
                      type="text"
                      value={messengerForm.url}
                      onChange={(e) => setMessengerForm({ ...messengerForm, url: e.target.value })}
                      className="w-full bg-transparent text-base text-[#576686] outline-none placeholder:text-[#576686]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsMessengerModalOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Отмена</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Добавить мессенджер</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}