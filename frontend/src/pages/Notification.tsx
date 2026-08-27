import React from "react";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#576686]/80 backdrop-blur-xs p-4 sm:p-8 font-['Inter'] selection:bg-[#2ABAEF]/20 animate-fadeIn">
      {/* Основной блок с точными размерами из макета */}
      <div className="relative w-[600px] h-[352px] bg-[#F5F7FA] rounded-[10px] p-[30px] shadow-2xl box-border border border-gray-200">
        
        {/* Кнопка закрытия (крестик) справа сверху */}
        <button
          type="button"
          aria-label="Закрыть"
          onClick={() => navigate(-1)}
          className="absolute right-[30px] top-[30px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/50 transition-all hover:bg-white hover:shadow-xs active:scale-95 cursor-pointer text-[#576686]"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 6.40951L17.59 4.99951L12 10.5895L6.41 4.99951L5 6.40951L10.59 11.9995L5 17.5895L6.41 18.9995L12 13.4095L17.59 18.9995L19 17.5895L13.41 11.9995L19 6.40951Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Заголовок */}
        <h1 className="pr-14 text-lg font-bold text-[#576686]">Уведомление</h1>

        {/* Блок с предупреждением */}
        <div className="mt-4 p-5 bg-[#576686] rounded-md flex flex-col justify-start items-start gap-[15px] w-full shadow-xs">
          <svg
            className="h-4 w-4 shrink-0 text-white"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.00033 3.99337L13.0203 12.6667H2.98033L8.00033 3.99337ZM8.00033 1.33337L0.666992 14H15.3337L8.00033 1.33337ZM8.66699 10.6667H7.33366V12H8.66699V10.6667ZM8.66699 6.66671H7.33366V9.33337H8.66699V6.66671Z"
              fill="white"
            />
          </svg>
          <p className="text-base leading-normal text-white">
            Данные пока не сохранены. При нажатии «Отмена» все внесённые
            изменения будут удалены. Чтобы сохранить данные, завершите
            действие перед выходом.
          </p>
        </div>

        {/* Кнопки внизу с точными отступами */}
        <div className="absolute bottom-[30px] left-[30px] right-[30px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-white px-5 py-4 text-base text-[#576686] border border-gray-200 transition-all hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] cursor-pointer"
          >
            <svg
              className="h-4 w-4 text-[#576686]"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3337 7.33329H5.22033L8.94699 3.60663L8.00033 2.66663L2.66699 7.99996L8.00033 13.3333L8.94033 12.3933L5.22033 8.66663H13.3337V7.33329Z"
                fill="currentColor"
              />
            </svg>
            <span>Вернуться</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#576686] px-5 py-4 text-base text-white transition-all hover:bg-[#475470] hover:shadow-md active:scale-[0.98] cursor-pointer font-medium"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.3"
                d="M3.33594 3.3335V12.6668H12.6693V5.22016L10.7826 3.3335H3.33594ZM8.0026 12.0002C6.89594 12.0002 6.0026 11.1068 6.0026 10.0002C6.0026 8.8935 6.89594 8.00016 8.0026 8.00016C9.10927 8.00016 10.0026 8.8935 10.0026 10.0002C10.0026 11.1068 9.10927 12.0002 8.0026 12.0002ZM10.0026 6.66683H4.0026V4.00016H10.0026V6.66683Z"
                fill="white"
              />
              <path
                d="M11.3333 2H3.33333C2.59333 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V4.66667L11.3333 2ZM12.6667 12.6667H3.33333V3.33333H10.78L12.6667 5.22V12.6667ZM8 8C6.89333 8 6 8.89333 6 10C6 11.1067 6.89333 12 8 12C9.10667 12 10 11.1067 10 10C10 8.89333 9.10667 8 8 8ZM4 4H10V6.66667H4V4Z"
                fill="white"
              />
            </svg>
            <span>Выйти на главную</span>
          </button>
        </div>

      </div>
    </div>
  );
}