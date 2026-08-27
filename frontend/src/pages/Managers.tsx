import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managersApi } from "../api/services";

function ManagerIcon({ className = "h-4 w-4 text-white" }: { className?: string }) {
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

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.3" d="M3.34 6.01L6.65 9.32L9.99 6.01L6.68 2.7L3.34 6.01Z" fill="currentColor"/>
      <path d="M2 11.3333V14H4.66667L12.5267 6.14L9.86 3.47333L2 11.3333ZM13.8867 4.78C14.0372 4.62947 14.1217 4.42525 14.1217 4.21233C14.1217 3.99941 14.0372 3.7952 13.8867 3.64467L12.3553 2.11333C12.2048 1.96282 12.0006 1.8783 11.7877 1.8783C11.5748 1.8783 11.3705 1.96282 11.22 2.11333L10.5333 2.8L13.2 5.46667L13.8867 4.78Z" fill="currentColor"/>
    </svg>
  );
}

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

export default function Managers() {
  const navigate = useNavigate();
  
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const loadManagers = async () => {
    try {
      setLoading(true);
      const data = await managersApi.getAll();
      setManagers(
        data.map((m: any) => ({
          ...m,
          isActive: m.isActive !== undefined ? m.isActive : true,
        }))
      );
    } catch (error) {
      console.error("Ошибка при получении списка менеджеров:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const toggleManagerStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = managers.find((m) => m._id === id);
    const newStatus = !current?.isActive;

    setManagers((prev) =>
      prev.map((m) => (m._id === id ? { ...m, isActive: newStatus } : m))
    );

    try {
      await managersApi.update(id, { isActive: newStatus });
    } catch (error) {
      console.error("Ошибка при обновлении статуса менеджера:", error);
    }
  };

  const filteredManagers = managers.filter((m) =>
    activeTab === "active" ? m.isActive : !m.isActive
  );

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "active"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  Активные
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("inactive")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "inactive"
                      ? "bg-white text-[#576686] shadow-sm font-medium"
                      : "bg-white/50 text-[#576686] hover:bg-white hover:shadow-xs"
                  }`}
                >
                  Не активные
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/managers/add")}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] pt-4 pb-[17px] pl-3 pr-5 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <ManagerIcon className="h-4 w-4 text-white" />
                <span className="font-normal text-[16px]">Добавить менеджера</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-5 mb-3 text-[12px] text-[#576686]">
              <div className="w-[300px]">ФИО</div>
              <div className="flex-1 pl-10">Дата регистрации</div>
              <div className="w-[120px] text-right"></div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                <p className="text-base font-medium">Загрузка списка менеджеров...</p>
              </div>
            ) : filteredManagers.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredManagers.map((manager) => (
                  <div
                    key={manager._id}
                    onClick={() => navigate(`/managers/detail?id=${manager._id}`)}
                    className="flex items-center justify-between rounded-[10px] bg-white px-5 h-[52px] border border-gray-100 shadow-xs hover:shadow-md hover:border-[#2ABAEF]/40 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
                  >
                    <div className="text-[16px] text-[#576686] font-normal w-[300px] group-hover:text-[#2ABAEF] transition-colors truncate">
                      {manager.name}
                    </div>
                    
                    <div className="flex-1 pl-10 text-[12px] text-[#576686]">
                      {formatDateTime(manager.createdAt)}
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => toggleManagerStatus(manager._id, e)}
                        aria-label="Переключить статус активности"
                        className={`h-[30px] w-[55px] rounded-full relative flex items-center px-1 transition-colors duration-200 cursor-pointer outline-none ${
                          manager.isActive ? "bg-[#F5F7FA]" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-[20px] h-[20px] rounded-full transition-all duration-200 transform shadow-xs ${
                            manager.isActive
                              ? "bg-[#2ABAEF] translate-x-[25px]"
                              : "bg-[#576686] translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/managers/add?id=${manager._id}`);
                        }}
                        aria-label="Редактировать"
                        className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#576686] hover:text-white active:scale-90 transition-all duration-150 cursor-pointer text-[#576686]"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#576686]/60">
                <p className="text-base font-medium">В этой категории нет менеджеров</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}