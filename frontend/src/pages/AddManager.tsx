import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { managersApi } from "../api/services";

// Форматирование ФИО: каждое слово с большой буквы
const formatFIO = (val: string) => {
  return val
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
};

export default function AddManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const managerId = searchParams.get("id");
  const isEditing = Boolean(managerId);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!managerId) return;

    const fetchManagerData = async () => {
      try {
        setIsLoading(true);
        const data = await managersApi.getById(managerId);
        if (data.manager) {
          setFullName(data.manager.name || "");
          setEmail(data.manager.email || "");
          setPassword("");
        }
      } catch (err) {
        console.error("Ошибка загрузки менеджера:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagerData();
  }, [managerId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || (!isEditing && !password.trim())) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: formatFIO(fullName.trim()),
        email: email.trim().toLowerCase(),
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (isEditing && managerId) {
        await managersApi.update(managerId, payload);
      } else {
        payload.role = "manager";
        await managersApi.create(payload);
      }

      navigate("/managers");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при сохранении менеджера");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white px-[210px] pt-0 pb-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="relative rounded-[10px] bg-[#F5F7FA] p-8 border border-gray-200 min-h-[408px] flex flex-col justify-between shadow-xs">
          <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
            <div>
              <h1 className="text-[#576686] text-[18px] font-bold mb-6">
                {isEditing ? "Редактирование менеджера" : "Добавление менеджера"}
              </h1>

              {error && (
                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 animate-fadeIn">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[30px] gap-y-6">
                {/* 1. ФИО с автозаглавными буквами */}
                <div className="group flex flex-col gap-2">
                  <label className="text-[#576686] text-[12px] font-normal transition-colors group-focus-within:text-[#2ABAEF]">
                    ФИО
                  </label>
                  <div className="w-full h-[52px] bg-white rounded-[6px] border border-[#576686]/20 px-4 flex items-center transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(formatFIO(e.target.value))}
                      placeholder="Иванов Иван Иванович"
                      className="w-full bg-transparent text-[#576686] text-[16px] font-normal outline-none placeholder:text-[#576686]/40"
                    />
                  </div>
                </div>

                {/* 2. E-mail */}
                <div className="group flex flex-col gap-2">
                  <label className="text-[#576686] text-[12px] font-normal transition-colors group-focus-within:text-[#2ABAEF]">
                    E-mail
                  </label>
                  <div className="w-full h-[52px] bg-white rounded-[6px] border border-[#576686]/20 px-4 flex items-center transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@ortera.ru"
                      className="w-full bg-transparent text-[#576686] text-[16px] font-normal outline-none placeholder:text-[#576686]/40"
                    />
                  </div>
                </div>

                {/* 3. Пароль */}
                <div className="group flex flex-col gap-2">
                  <label className="text-[#576686] text-[12px] font-normal transition-colors group-focus-within:text-[#2ABAEF]">
                    {isEditing ? "Новый пароль (оставьте пустым, если не меняется)" : "Пароль"}
                  </label>
                  <div className="relative w-full h-[52px] bg-white rounded-[6px] border border-[#576686]/20 pl-4 pr-12 flex items-center transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!isEditing}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isEditing ? "••••••••" : "Введите пароль"}
                      className="w-full bg-transparent text-[#576686] text-[16px] font-normal outline-none placeholder:text-[#576686]/40"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                      className="absolute right-4 text-[#576686]/50 hover:text-[#576686] group-focus-within:text-[#2ABAEF] transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/managers")}
                className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-white px-5 text-base text-[#576686] border border-gray-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <span>Отмена</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[52px] items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-6 text-base text-white hover:bg-[#475470] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? "Сохранение..." : "Сохранить"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}