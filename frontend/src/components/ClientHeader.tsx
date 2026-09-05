import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronUp, ChevronDown } from "lucide-react";
import { authApi } from "../api/services";
import { useSearch } from "../context/SearchContext";

function AnalyticsChartIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 13.5H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 11V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 7.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 4.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 2V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 8L6.5 4.5L10 6.5L14 2" stroke="#2ABAEF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const clientNavItems = [
  {
    to: "/client",
    label: "Мои задачи",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
        <g clipPath="url(#clip0_18_140_client)">
          <path opacity="0.3" d="M3.33594 3.33301V12.6663H12.6693V3.33301H3.33594ZM9.33594 11.333H4.66927V9.99967H9.33594V11.333ZM11.3359 8.66634H4.66927V7.33301H11.3359V8.66634ZM11.3359 5.99967H4.66927V4.66634H11.3359V5.99967Z" fill="currentColor" />
          <path d="M12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 13.333V3.33333C14 2.6 13.4 2 12.6667 2ZM12.6667 12.6667H3.33333V3.33333H12.6667V12.6667ZM11.3333 8.66667H4.66667V7.33333H11.3333V8.66667ZM11.3333 6H4.66667V4.66667H11.3333V6ZM9.33333 11.3333H4.66667V10H9.33333V11.3333Z" fill="currentColor" />
        </g>
        <defs>
          <clipPath id="clip0_18_140_client">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    to: "/client/clients",
    label: "Мои клиенты",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
        <g clipPath="url(#clip0_18_159_client)">
          <path opacity="0.3" d="M8.00521 2.66602C5.05854 2.66602 2.67188 5.05268 2.67188 7.99935C2.67188 9.29935 3.13854 10.486 3.91188 11.4127C5.03854 10.5327 6.45854 9.99935 8.00521 9.99935C9.55188 9.99935 10.9719 10.5327 12.0985 11.4127C12.8719 10.486 13.3385 9.29935 13.3385 7.99935C13.3385 5.05268 10.9519 2.66602 8.00521 2.66602ZM8.00521 8.66602C6.71854 8.66602 5.67188 7.61935 5.67188 6.33268C5.67188 5.04602 6.71854 3.99941 8.00521 3.99941C9.29188 3.99941 10.3385 5.04602 10.3385 6.33268C10.3385 7.61935 9.29188 8.66602 8.00521 8.66602Z" fill="currentColor" />
          <path d="M8.0026 1.33301C4.3226 1.33301 1.33594 4.31967 1.33594 7.99967C1.33594 11.6797 4.3226 14.6663 8.0026 14.6663C11.6826 14.6663 14.6693 11.6797 14.6693 7.99967C14.6693 4.31967 11.6826 1.33301 8.0026 1.33301ZM8.0026 13.333C6.8426 13.333 5.77594 12.9597 4.9026 12.333C5.77594 11.7063 6.8426 11.333 8.0026 11.333C9.1626 11.333 10.2293 11.7063 11.1026 12.333C10.2293 12.9597 9.1626 13.333 8.0026 13.333ZM12.0959 11.413C10.9693 10.533 9.54927 9.99967 8.0026 9.99967C6.45594 9.99967 5.03594 10.533 3.90927 11.413C3.13594 10.4863 2.66927 9.29967 2.66927 7.99967C2.66927 5.05301 5.05594 2.66634 8.0026 2.66634C10.9493 2.66634 13.3359 5.05301 13.3359 7.99967C13.3359 9.29967 12.8693 10.4863 12.0959 11.413Z" fill="currentColor" />
          <path d="M8.00521 3.95312C6.71854 3.95312 5.67188 4.99979 5.67188 6.28646C5.67188 7.57313 6.71854 8.61979 8.00521 8.61979C9.29187 8.61979 10.3385 7.57313 10.3385 6.28646C10.3385 4.99979 9.29187 3.95312 8.00521 3.95312ZM8.00521 7.28646C7.45187 7.28646 7.00521 6.83979 7.00521 6.28646C7.00521 5.73313 7.45187 5.28646 8.00521 5.28646C8.55854 5.28646 9.00521 5.73313 9.00521 6.28646C9.00521 6.83979 8.55854 7.28646 8.00521 7.28646Z" fill="currentColor" />
        </g>
        <defs>
          <clipPath id="clip0_18_159_client">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    to: "/client/schedule",
    label: "График обучения",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
        <g clipPath="url(#clip0_18_169_client)">
          <path opacity="0.3" d="M12.6693 4H3.33594V5.33333H12.6693V4Z" fill="currentColor" />
          <path d="M12.6667 2.66634H12V1.33301H10.6667V2.66634H5.33333V1.33301H4V2.66634H3.33333C2.59333 2.66634 2.00667 3.26667 2.00667 3.99967L2 13.333C2 14.0663 2.59333 14.6663 3.33333 14.6663H12.6667C13.4 14.6663 14 14.0663 14 13.333V3.99967C14 3.26634 13.4 2.66634 12.6667 2.66634ZM12.6667 13.333H3.33333V6.66634H12.6667V13.333ZM12.6667 5.33301H3.33333V3.99967H12.6667V5.33301ZM6 9.33301H4.66667V7.99967H6V9.33301H8.66667H7.33333V7.99967H8.66667V9.33301ZM11.3333 9.33301H10V7.99967H11.3333V9.33301ZM6 11.9997H4.66667V10.6663H6V11.9997ZM8.66667 11.9997H7.33333V10.6663H8.66667V11.9997ZM11.3333 11.9997H10V10.6663H11.3333V11.9997Z" fill="currentColor" />
        </g>
        <defs>
          <clipPath id="clip0_18_169_client">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    to: "/client/stats",
    label: "Мой доход и статистика",
    icon: <AnalyticsChartIcon />,
  },
];

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
    <g clipPath="url(#clip0_18_177_client)">
      <path d="M3.33333 3.33333H8V2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H8V12.6667H3.33333V3.33333ZM14 8L11.3333 5.33333V7.33333H6V8.66667H11.3333V10.6667L14 8Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_18_177_client">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default function ClientHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    currentIndex,
    totalMatches,
    goToNextMatch,
    goToPrevMatch,
    clearSearch,
  } = useSearch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevMatch();
      } else {
        goToNextMatch();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[100px] bg-white/95 backdrop-blur-md flex items-center border-b border-gray-100 transition-colors">
      <div className="mx-auto flex h-full w-full max-w-[1920px] items-center justify-between px-[210px]">
        
        {/* Логотип */}
        <Link 
          to="/client" 
          className="shrink-0 flex items-center hover:opacity-85 active:scale-95 transition-all duration-200"
        >
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/34d032a1b86c25d0f5d07e554e11f396a22d2d8a?width=300"
            alt="ORTERA"
            className="h-8 w-auto md:h-10"
          />
        </Link>

        {/* Навигация Менеджера */}
        <nav className="hidden flex-1 items-center lg:flex justify-start ml-[60px] gap-[30px]">
          {clientNavItems.map((item) => {
            const isActive =
              item.to === "/client"
                ? location.pathname === "/client" || location.pathname === "/client/tasks"
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex h-[44px] items-center gap-[10px] px-3 py-3 text-base font-normal font-['Inter'] transition-all duration-200 border-b-2 active:scale-[0.98] ${
                  isActive
                    ? "border-[#2abaef] text-[#2abaef] font-medium"
                    : "border-transparent text-gray-500 hover:text-[#2abaef] hover:border-[#2abaef]/30"
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap transition-colors">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Правый блок: Интерактивный поиск на странице и Выход */}
        <div className="ml-auto hidden items-center md:flex gap-[40px]">
          <div className="relative w-[450px] h-[52px] group">
            <input
              type="text"
              placeholder="Поиск на странице..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full rounded-[6px] border border-gray-200 bg-white pl-4 pr-24 text-xs text-slate-700 placeholder:text-gray-400 outline-none transition-all duration-200 hover:border-gray-300 focus:border-[#2abaef] focus:ring-4 focus:ring-[#2abaef]/15"
            />

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <>
                  <span className="text-[11px] font-medium text-[#576686] bg-gray-100 px-1.5 py-0.5 rounded-sm select-none">
                    {totalMatches > 0 ? `${currentIndex + 1}/${totalMatches}` : "0/0"}
                  </span>

                  {totalMatches > 0 && (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={goToPrevMatch}
                        title="Предыдущее (Shift+Enter)"
                        className="size-6 flex items-center justify-center rounded-sm hover:bg-gray-100 text-[#576686] active:scale-90 transition-all cursor-pointer"
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextMatch}
                        title="Следующее (Enter)"
                        className="size-6 flex items-center justify-center rounded-sm hover:bg-gray-100 text-[#576686] active:scale-90 transition-all cursor-pointer"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={clearSearch}
                    className="size-5 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => authApi.logout()}
            className="group flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-normal text-gray-500 hover:text-[#2abaef] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <LogoutIcon />
            <span className="transition-colors">Выйти</span>
          </button>
        </div>

        {/* Мобильная кнопка меню */}
        <button
          type="button"
          aria-label="Открыть меню"
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#2abaef] active:scale-90 transition-all duration-200 lg:hidden cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="absolute top-[100px] left-0 w-full border-t border-gray-200 bg-white px-6 pb-4 lg:hidden shadow-lg animate-fadeIn">
          <div className="relative my-3">
            <input
              type="text"
              placeholder="Поиск на странице..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-md border border-gray-200 bg-white pl-3 pr-9 text-xs text-slate-700 placeholder:text-gray-400 outline-none focus:border-[#2abaef] focus:ring-2 focus:ring-[#2abaef]/15 transition-all"
            />
          </div>

          <nav className="flex flex-col gap-1">
            {clientNavItems.map((item) => {
              const isActive =
                item.to === "/client"
                  ? location.pathname === "/client" || location.pathname === "/client/tasks"
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-normal transition-all duration-150 ${
                    isActive
                      ? "bg-[#2abaef]/10 text-[#2abaef] font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#2abaef]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center justify-end border-t border-gray-100 pt-3 px-3">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  authApi.logout();
                }}
                className="group flex items-center gap-2 text-sm font-normal text-gray-500 hover:text-[#2abaef] transition-colors cursor-pointer"
              >
                <LogoutIcon />
                <span>Выйти</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}