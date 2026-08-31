import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, MapPin, Loader2, X } from "lucide-react";

interface CitySuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

interface SuggestionItem {
  displayName: string;
  city: string;
  region: string;
}

export default function CitySuggestInput({
  value,
  onChange,
  placeholder = "Введите город или населенный пункт...",
  required = false,
}: CitySuggestInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Синхронизация внешнего значения со стейтом инпута
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Живой поиск через открытое API геокодирования Nominatim (OSM)
  useEffect(() => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ru,by,kz&addressdetails=1&limit=8&q=${encodeURIComponent(
            cleanQuery
          )}`
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          const formatted: SuggestionItem[] = data
            .map((item: any) => {
              const addr = item.address || {};
              const name =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.hamlet ||
                addr.suburb ||
                item.name;
              const state = addr.state || addr.region || addr.county || "";

              if (!name) return null;

              return {
                displayName: state ? `${name} (${state})` : name,
                city: name,
                region: state,
              };
            })
            .filter((item): item is SuggestionItem => item !== null);

          // Убираем дубликаты
          const unique = formatted.filter(
            (v, i, a) => a.findIndex((t) => t.displayName === v.displayName) === i
          );

          setSuggestions(unique);
          setIsOpen(unique.length > 0);
        }
      } catch (err) {
        console.error("Ошибка поиска населенного пункта:", err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SuggestionItem) => {
    setQuery(item.displayName);
    onChange(item.displayName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center w-full h-12 bg-white rounded-md border border-[rgba(87,102,134,0.2)] px-4 transition-all duration-200 hover:border-[#576686]/60 focus-within:border-[#2ABAEF] focus-within:ring-4 focus-within:ring-[#2ABAEF]/15">
        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-base text-[#576686] outline-none pr-8 placeholder:text-[#576686]/40"
        />

        <div className="absolute right-3 flex items-center gap-1.5 text-[#576686]/50">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-[#2ABAEF]" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="size-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <ChevronDown className="size-4 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Выпадающий список совпадений */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-[52px] left-0 z-50 w-full rounded-[8px] bg-white p-1.5 shadow-2xl border border-gray-200 max-h-60 overflow-y-auto flex flex-col gap-1 animate-fadeIn">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-md hover:bg-[#F5F7FA] text-[#576686] hover:text-[#2ABAEF] cursor-pointer transition-colors"
            >
              <MapPin className="size-4 shrink-0 mt-0.5 opacity-60" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.city}</span>
                {item.region && (
                  <span className="text-[11px] opacity-60 leading-tight">
                    {item.region}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}