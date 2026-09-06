import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "../api/services";

export default function Auth() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!login.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.login({ 
        email: login.trim(), 
        password: password.trim() 
      });

      const role = data.user?.role;

      if (role === "partner") {
        navigate("/partner");
      } else if (role === "manager" || role === "client") {
        navigate("/client");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Неверный логин или пароль. Попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-12 font-['Inter'] selection:bg-[#2ABAEF]/20">
      <div className="w-full max-w-[600px] flex flex-col">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/507a728f26a32594d6eeafa7e1d1d91c9f987324"
          alt="ORTERA"
          className="w-[150px] h-[48px] mb-6 object-contain self-start hover:opacity-90 transition-opacity cursor-pointer"
        />

        <div className="w-full rounded-[10px] bg-[#F5F7FA] border border-dashed border-gray-300 p-[30px] shadow-xs transition-all">
          <h1 className="text-[20px] font-bold text-[#576686] mb-6">
            Авторизация
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-500 font-medium animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label htmlFor="login" className="block text-xs text-[#576686] mb-2 font-medium">
                Логин
              </label>
              <input
                id="login"
                name="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Логин"
                autoComplete="username"
                className="w-full h-[52px] rounded-md border border-[rgba(87,102,134,0.2)] bg-white px-5 text-base text-[#576686] placeholder:text-[#576686]/40 outline-none transition-all duration-200 hover:border-[rgba(87,102,134,0.4)] focus:border-[#2ABAEF] focus:ring-3 focus:ring-[#2ABAEF]/15"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="block text-xs text-[#576686] mb-2 font-medium">
                Пароль
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  autoComplete="current-password"
                  className="w-full h-[52px] rounded-md border border-[rgba(87,102,134,0.2)] bg-white pl-5 pr-12 text-base text-[#576686] placeholder:text-[#576686]/40 outline-none transition-all duration-200 hover:border-[rgba(87,102,134,0.4)] focus:border-[#2ABAEF] focus:ring-3 focus:ring-[#2ABAEF]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#576686]/50 hover:text-[#576686] transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] rounded-[10px] bg-[#576686] text-white text-base font-medium transition-all duration-200 hover:bg-[#576686]/90 hover:shadow-md active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                <span>Войти</span>
              )}
            </button>

            <p className="text-[14px] text-[#576686] leading-snug mt-2">
              Для восстановления пароля следует обратиться<br />к администратору.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}