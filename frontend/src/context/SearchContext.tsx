import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentIndex: number;
  totalMatches: number;
  goToNextMatch: () => void;
  goToPrevMatch: () => void;
  clearSearch: () => void;
}

const defaultContextValue: SearchContextType = {
  searchQuery: "",
  setSearchQuery: () => {},
  currentIndex: 0,
  totalMatches: 0,
  goToNextMatch: () => {},
  goToPrevMatch: () => {},
  clearSearch: () => {},
};

const SearchContext = createContext<SearchContextType>(defaultContextValue);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  // Удаление всех созданных ранее тегов подсветки
  const clearHighlights = useCallback(() => {
    const marks = document.querySelectorAll("mark.ortera-search-highlight");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent.normalize();
      }
    });
    setTotalMatches(0);
    setCurrentIndex(0);
  }, []);

  // Очистка при переходах по страницам
  useEffect(() => {
    const handleLocationChange = () => {
      setSearchQuery("");
      clearHighlights();
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [clearHighlights]);

  // Подсветка совпадений в DOM дереве
  useEffect(() => {
    clearHighlights();
    const cleanQuery = searchQuery.trim();

    if (!cleanQuery || cleanQuery.length < 2) {
      return;
    }

    const container = document.getElementById("crm-page-content");
    if (!container) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        const parentTag = node.parentElement?.tagName.toLowerCase();
        if (
          ["script", "style", "input", "textarea", "select", "noscript"].includes(parentTag || "")
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.parentElement?.closest(".no-search")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    const regex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    let matchCount = 0;

    textNodes.forEach((node) => {
      const text = node.textContent;
      if (!text || !regex.test(text)) return;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = regex.lastIndex;

        if (matchStart > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
        }

        const mark = document.createElement("mark");
        mark.className =
          "ortera-search-highlight bg-amber-200 text-slate-900 rounded-xs px-0.5 outline outline-1 outline-amber-400 transition-all duration-200";
        mark.dataset.matchIndex = String(matchCount);
        mark.textContent = match[0];
        fragment.appendChild(mark);

        matchCount++;
        lastIndex = matchEnd;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode?.replaceChild(fragment, node);
    });

    setTotalMatches(matchCount);
    setCurrentIndex(matchCount > 0 ? 0 : 0);

    if (matchCount > 0) {
      updateActiveHighlight(0);
    }
  }, [searchQuery, clearHighlights]);

  // Обновление активного элемента и плавный скролл к нему
  const updateActiveHighlight = (index: number) => {
    const marks = document.querySelectorAll("mark.ortera-search-highlight");
    marks.forEach((m, idx) => {
      if (idx === index) {
        m.classList.remove("bg-amber-200", "text-slate-900", "outline-amber-400");
        m.classList.add("bg-[#2abaef]", "text-white", "outline-2", "outline-[#0284c7]", "shadow-md");
        m.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        m.classList.remove("bg-[#2abaef]", "text-white", "outline-2", "outline-[#0284c7]", "shadow-md");
        m.classList.add("bg-amber-200", "text-slate-900", "outline-amber-400");
      }
    });
  };

  const goToNextMatch = useCallback(() => {
    if (totalMatches === 0) return;
    const nextIdx = (currentIndex + 1) % totalMatches;
    setCurrentIndex(nextIdx);
    updateActiveHighlight(nextIdx);
  }, [currentIndex, totalMatches]);

  const goToPrevMatch = useCallback(() => {
    if (totalMatches === 0) return;
    const prevIdx = (currentIndex - 1 + totalMatches) % totalMatches;
    setCurrentIndex(prevIdx);
    updateActiveHighlight(prevIdx);
  }, [currentIndex, totalMatches]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    clearHighlights();
  }, [clearHighlights]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        currentIndex,
        totalMatches,
        goToNextMatch,
        goToPrevMatch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  return context || defaultContextValue;
};