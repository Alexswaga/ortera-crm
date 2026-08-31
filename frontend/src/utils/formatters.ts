// Автоматическая капитализация каждого слова (для ФИО, сотрудников)
export const formatCapitalizeWords = (val: string): string => {
  return val.replace(/(^|[\s\-])([a-zа-яё])/gu, (_, sep, char) => sep + char.toUpperCase());
};

// Автоматическая капитализация первой буквы (для городов, названий)
export const formatCapitalizeFirst = (val: string): string => {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
};

// Гибкий международный формат телефона: сохраняет префикс +, цифры, пробелы и дефисы
export const formatPhone = (val: string): string => {
  if (!val) return "";
  const cleaned = val.replace(/[^\d+()\s-]/g, "");
  return cleaned;
};

// Только цифры для ИНН (максимум 12 символов)
export const formatINN = (val: string): string => {
  return val.replace(/\D/g, "").slice(0, 12);
};