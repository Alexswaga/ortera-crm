import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { scheduleApi } from "../api/services";

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

export default function AddEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("id");
  const isEditing = Boolean(eventId);

  const [formData, setFormData] = useState({
    startDate: "10.08.2026",
    startTime: "10:00",
    endTime: "12:00",
    endDate: "11.08.2026",
    location: "Чебоксары",
    title: "Курс: Производство каркасных стелек",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Подгрузка данных редактируемого события
  useEffect(() => {
    if (!eventId) return;

    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const allEvents = await scheduleApi.getAll();
        const currentEvent = allEvents.find((item: any) => item._id === eventId);

        if (currentEvent) {
          setFormData({
            startDate: currentEvent.startDate || "",
            startTime: currentEvent.startTime || "10:00",
            endTime: currentEvent.endTime || "12:00",
            endDate: currentEvent.endDate || "",
            location: currentEvent.location || "",
            title: currentEvent.title || "",
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки события:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        startDate: formData.startDate.trim(),
        startTime: formData.startTime.trim(),
        endDate: formData.endDate.trim(),
        endTime: formData.endTime.trim(),
      };

      if (isEditing && eventId) {
        await scheduleApi.update(eventId, payload);
      } else {
        await scheduleApi.create(payload);
      }

      navigate("/schedule");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при сохранении события в расписание");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[384px] flex flex-col justify-between shadow-xs">
          
          <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
            <div>
              <h1 className="text-[18px] font-bold text-[#576686] mb-8">
                {isEditing ? "Редактирование события" : "Создание события"}
              </h1>

              {error && (
                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 animate-fadeIn">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[30px] gap-y-6 mb-6">
                
                <div className="group flex flex-col gap-2">
                  <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                    Дата
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      placeholder="ДД.ММ.ГГГГ"
                      className="w-36 h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-base text-[#576686] outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                    />

                    <input
                      type="text"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="00:00"
                      className="w-36 h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-base text-[#576686] outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                    />

                    <span className="text-base text-[#576686] px-1 select-none font-normal">
                      по
                    </span>

                    <input
                      type="text"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="00:00"
                      className="w-36 h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-base text-[#576686] outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                    />

                    <input
                      type="text"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      placeholder="ДД.ММ.ГГГГ"
                      className="w-36 h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-base text-[#576686] outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                    />
                  </div>
                </div>

                <div className="group flex flex-col gap-2">
                  <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                    Место
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-base text-[#576686] outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                  />
                </div>

              </div>

              <div className="group flex flex-col gap-2">
                <label className="text-xs text-[#576686] font-medium transition-colors group-focus-within:text-[#2ABAEF]">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-12 rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-4 text-base text-[#576686] outline-none transition-all duration-200 hover:border-[#576686]/60 focus:border-[#2ABAEF] focus:ring-4 focus:ring-[#2ABAEF]/15 placeholder:text-[#576686]/40"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/schedule")}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer font-normal"
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
          </form>

        </div>

      </div>
    </div>
  );
}