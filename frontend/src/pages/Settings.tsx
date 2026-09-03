import React, { useState, useEffect, FormEvent } from "react";
import { Plus, X, Trash2, Edit2, Check, Layers } from "lucide-react";
import { settingsApi } from "../api/services";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"tags" | "specialties" | "course_types">("tags");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Форма добавления
  const [newName, setNewName] = useState("");
  const [newMaxStudents, setNewMaxStudents] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Редактирование
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingMaxStudents, setEditingMaxStudents] = useState(10);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const typeParam = activeTab === "tags" ? "tag" : activeTab === "specialties" ? "specialty" : "course_type";
      const data = await settingsApi.getAll(typeParam);
      setItems(data || []);
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [activeTab]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      const typeParam = activeTab === "tags" ? "tag" : activeTab === "specialties" ? "specialty" : "course_type";
      
      await settingsApi.create({
        type: typeParam,
        name: newName.trim(),
        maxStudents: activeTab === "course_types" ? Number(newMaxStudents) || 10 : undefined,
      });

      setNewName("");
      setNewMaxStudents(10);
      await loadSettings();
    } catch (err) {
      console.error("Ошибка создания:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingId(item._id);
    setEditingName(item.name);
    setEditingMaxStudents(item.maxStudents || 10);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      await settingsApi.update(id, {
        name: editingName.trim(),
        maxStudents: activeTab === "course_types" ? Number(editingMaxStudents) || 10 : undefined,
      });
      setEditingId(null);
      await loadSettings();
    } catch (err) {
      console.error("Ошибка обновления:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить этот элемент?")) return;
    try {
      await settingsApi.delete(id);
      await loadSettings();
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[500px] flex flex-col justify-start shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tags")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "tags"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white text-[#576686] hover:bg-slate-100 border border-gray-200"
                  }`}
                >
                  Теги клиентов
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("specialties")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer ${
                    activeTab === "specialties"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white text-[#576686] hover:bg-slate-100 border border-gray-200"
                  }`}
                >
                  Специальности
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("course_types")}
                  className={`rounded-[10px] px-5 py-4 text-base transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    activeTab === "course_types"
                      ? "bg-[#576686] text-white shadow-sm font-medium"
                      : "bg-white text-[#576686] hover:bg-slate-100 border border-gray-200"
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#2ABAEF]" />
                  <span>Типы курсов</span>
                </button>
              </div>
            </div>

            {/* Форма добавления */}
            <form onSubmit={handleCreate} className="mb-8 p-6 bg-white rounded-[10px] border border-gray-200 shadow-2xs">
              <h2 className="text-[16px] font-bold text-[#576686] mb-4">
                {activeTab === "tags" && "Добавить новый тег"}
                {activeTab === "specialties" && "Добавить новую специальность"}
                {activeTab === "course_types" && "Добавить новый тип курса (шаблон)"}
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    required
                    placeholder={
                      activeTab === "tags"
                        ? "Название тега..."
                        : activeTab === "specialties"
                        ? "Название специальности..."
                        : "Название обучающего курса..."
                    }
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-12 bg-[#F5F7FA] rounded-md border border-[#576686]/20 px-4 text-base text-[#576686] outline-none focus:border-[#2ABAEF]"
                  />
                </div>

                {activeTab === "course_types" && (
                  <div className="w-full md:w-40">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      placeholder="Мест"
                      value={newMaxStudents}
                      onChange={(e) => setNewMaxStudents(Number(e.target.value))}
                      className="w-full h-12 bg-[#F5F7FA] rounded-md border border-[#576686]/20 px-4 text-base text-[#576686] outline-none focus:border-[#2ABAEF]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto h-12 px-6 rounded-md bg-[#576686] text-white text-base font-medium hover:bg-[#475470] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Добавить</span>
                </button>
              </div>
            </form>

            {/* Список элементов */}
            {loading ? (
              <div className="flex items-center justify-center h-48 text-[#576686]/60">
                <p className="text-base font-medium">Загрузка...</p>
              </div>
            ) : items.length > 0 ? (
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const isEditing = editingId === item._id;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between h-16 px-6 bg-white rounded-[10px] border border-gray-100 shadow-xs text-[#576686]"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-3 flex-1 mr-4">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 h-10 bg-[#F5F7FA] rounded-md border border-[#2ABAEF] px-3 text-base text-[#576686] outline-none"
                          />
                          {activeTab === "course_types" && (
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={editingMaxStudents}
                              onChange={(e) => setEditingMaxStudents(Number(e.target.value))}
                              className="w-28 h-10 bg-[#F5F7FA] rounded-md border border-[#2ABAEF] px-3 text-base text-[#576686] outline-none"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] font-normal">{item.name}</span>
                          {activeTab === "course_types" && (
                            <span className="text-xs text-[#576686]/60 bg-[#F5F7FA] px-2.5 py-1 rounded-full border border-gray-200">
                              {item.maxStudents || 10} мест
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item._id)}
                            className="size-9 rounded-md bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Сохранить"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="size-9 rounded-md bg-[#F5F7FA] text-[#576686] hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="size-9 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-[#576686]/60">
                <p className="text-base font-medium">Список пуст</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}