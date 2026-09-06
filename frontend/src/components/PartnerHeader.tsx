import React from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/services";

export default function PartnerHeader() {
  return (
    <header className="sticky top-0 z-50 w-full h-[100px] bg-white/95 backdrop-blur-md flex items-center border-b border-gray-100 transition-colors">
      <div className="mx-auto flex h-full w-full max-w-[1920px] items-center justify-between px-[210px]">
        <Link to="/partner" className="shrink-0 flex items-center hover:opacity-85 transition-all">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/34d032a1b86c25d0f5d07e554e11f396a22d2d8a?width=300"
            alt="ORTERA"
            className="h-8 w-auto md:h-10"
          />
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-[#576686] bg-[#F5F7FA] px-4 py-2 rounded-full border border-gray-200">
            Кабинет сетевого партнёра
          </span>

          <button
            type="button"
            onClick={() => authApi.logout()}
            className="text-sm font-normal text-gray-500 hover:text-[#2abaef] transition-colors cursor-pointer px-3 py-2"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}