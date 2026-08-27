import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { settingsApi } from "../api/services";

// Векторная дискета сохранения (16x16)
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

interface SettingItem {
  _id?: string;
  name: string;
  type: "tag" | "specialty";
}

export default function Settings() {
  const navigate = useNavigate();

  // Активная вкладка настроек
  const [activeTab, setActiveTab] = useState<"tags" | "specialties">("tags");

  // Списки элементов
  const [tags, setTags] = useState<SettingItem[]>([]);
  const [specialties, setSpecialties] = useState<SettingItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка существующих тегов и специальностей из базы данных
  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getAll();
      setTags(data.filter((item: any) => item.type === "tag"));
      setSpecialties(data.filter((item: any) => item.type === "specialty"));
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Изменение значения тега
  const handleTagChange = (index: number, value: string) => {
    setTags((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: value };
      return next;
    });
  };

  // Удаление тега
  const handleRemoveTag = (index: number) => {
    const item = tags[index];
    if (item._id) {
      setDeletedIds((prev) => [...prev, item._id!]);
    }
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  // Добавление нового тега
  const handleAddTag = () => {
    setTags((prev) => [...prev, { name: "", type: "tag" }]);
  };

  // Изменение значения специальности
  const handleSpecialtyChange = (index: number, value: string) => {
    setSpecialties((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: value };
      return next;
    });
  };

  // Удаление специальности
  const handleRemoveSpecialty = (index: number) => {
    const item = specialties[index];
    if (item._id) {
      setDeletedIds((prev) => [...prev, item._id!]);
    }
    setSpecialties((prev) => prev.filter((_, i) => i !== index));
  };

  // Добавление новой специальности
  const handleAddSpecialty = () => {
    setSpecialties((prev) => [...prev, { name: "", type: "specialty" }]);
  };

  // Сохранение всех изменений в MongoDB
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // 1. Удаление удаленных элементов
      await Promise.all(deletedIds.map((id) => settingsApi.delete(id)));

      // 2. Создание новых и обновление существующих тегов
      await Promise.all(
        tags.map(async (t) => {
          const trimmed = t.name.trim();
          if (!trimmed) return;
          if (t._id) {
            return settingsApi.update(t._id, trimmed);
          } else {
            return settingsApi.create({ type: "tag", name: trimmed });
          }
        })
      );

      // 3. Создание новых и обновление существующих специальностей
      await Promise.all(
        specialties.map(async (s) => {
          const trimmed = s.name.trim();
          if (!trimmed) return;
          if (s._id) {
            return settingsApi.update(s._id, trimmed);
          } else {
            return settingsApi.create({ type: "specialty", name: trimmed });
          }
        })
      );

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при сохранении настроек");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Главный светло-серый блок w-[1500px] h-[850px] */}
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[850px] flex flex-col justify-between shadow-xs">
          
          <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
            <div>
              {/* Заголовок страницы */}
              <h1 className="text-[18px] font-bold text-[#576686] mb-8">
                Настройки
              </h1>

              {error && (
                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 animate-fadeIn">
                  {error}
                </div>
              )}

              {/* Двухколоночный макет: Сайдбар вкладок слева (w-80) и список полей справа (w-[1080px]) */}
              <div className="flex flex-col lg:flex-row gap-[60px]">
                
                {/* 1. Левый блок вкладок (w-80 / 320px) */}
                <div className="w-full lg:w-[320px] shrink-0">
                  <div className="w-full bg-white rounded-[10px] p-4 shadow-xs border border-gray-100 flex flex-col">
                    
                    {/* Вкладка 1: Создание тегов */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("tags")}
                      className={`w-full h-11 px-4 flex items-center text-base transition-all duration-150 cursor-pointer text-left border-b ${
                        activeTab === "tags"
                          ? "border-[#2ABAEF] text-[#2ABAEF] font-medium"
                          : "border-gray-100 text-[#576686] hover:text-[#2ABAEF]"
                      }`}
                    >
                      Создание тегов
                    </button>

                    {/* Вкладка 2: Специальность / деятельность */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("specialties")}
                      className={`w-full h-11 px-4 flex items-center text-base transition-all duration-150 cursor-pointer text-left ${
                        activeTab === "specialties"
                          ? "border-b border-[#2ABAEF] text-[#2ABAEF] font-medium"
                          : "text-[#576686] hover:text-[#2ABAEF]"
                      }`}
                    >
                      Специальность / деятельность
                    </button>

                  </div>
                </div>

                {/* 2. Правый блок: Список редактируемых полей */}
                <div className="flex-1 max-w-[1080px]">
                  
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 text-[#576686]/60">
                      <p className="text-base">Загрузка настроек...</p>
                    </div>
                  ) : activeTab === "tags" ? (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      {tags.map((tag, index) => (
                        <div
                          key={tag._id || index}
                          className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                        >
                          <input
                            type="text"
                            value={tag.name}
                            onChange={(e) => handleTagChange(index, e.target.value)}
                            placeholder="Введите название тега"
                            className="w-full bg-transparent text-base text-[#576686] outline-none pr-10 placeholder:text-[#576686]/40"
                          />
                          
                          {/* Кнопка удаления тега */}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            aria-label="Удалить тег"
                            className="absolute right-4 text-[#576686]/50 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Кнопка «Добавить тег» */}
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="flex items-center gap-3 mt-4 text-[#576686] hover:text-[#2ABAEF] transition-colors group cursor-pointer w-fit select-none"
                      >
                        <div className="size-12 rounded-md bg-[#576686] text-white group-hover:bg-[#475470] group-hover:shadow-xs active:scale-95 flex items-center justify-center transition-all duration-150">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-base font-normal">
                          Добавить тег
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      {specialties.map((specialty, index) => (
                        <div
                          key={specialty._id || index}
                          className="relative flex items-center w-full h-12 bg-white rounded-md border border-[#576686]/20 px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15"
                        >
                          <input
                            type="text"
                            value={specialty.name}
                            onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                            placeholder="Введите название специальности"
                            className="w-full bg-transparent text-base text-[#576686] outline-none pr-10 placeholder:text-[#576686]/40"
                          />
                          
                          {/* Кнопка удаления специальности */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(index)}
                            aria-label="Удалить специальность"
                            className="absolute right-4 text-[#576686]/50 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Кнопка «Добавить специальность» */}
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="flex items-center gap-3 mt-4 text-[#576686] hover:text-[#2ABAEF] transition-colors group cursor-pointer w-fit select-none"
                      >
                        <div className="size-12 rounded-md bg-[#576686] text-white group-hover:bg-[#475470] group-hover:shadow-xs active:scale-95 flex items-center justify-center transition-all duration-150">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-base font-normal">
                          Добавить специальность
                        </span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* Нижний ряд кнопок: «Отмена» и «Сохранить» */}
            <div className="mt-12 flex items-center justify-end gap-4">
              
              {/* Кнопка «Отмена» */}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 border border-gray-200 active:scale-[0.98] transition-all duration-150 cursor-pointer font-normal"
              >
                <X className="w-4 h-4" />
                <span>Отмена</span>
              </button>

              {/* Кнопка «Сохранить» */}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-6 py-4 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium disabled:opacity-60"
              >
                <SaveFloppyIcon className="w-4 h-4 text-white" />
                <span>{isSaving ? "Сохранение..." : "Сохранить"}</span>
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}