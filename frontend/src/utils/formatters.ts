// Автоматическая капитализация каждого слова (для ФИО, сотрудников)
export const formatCapitalizeWords = (val: string): string => {
  return val.replace(/(^|[\s\-])([a-zа-яё])/gu, (_, sep, char) => sep + char.toUpperCase());
};

// Автоматическая капитализация первой буквы (для городов, названий)
export const formatCapitalizeFirst = (val: string): string => {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
};

// Единый формат номера телефона: +7 927 668 95 18
export const formatPhone = (val: string): string => {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  
  let d = digits;
  if (d.startsWith("7") || d.startsWith("8")) {
    d = d.slice(1);
  }
  
  let res = "+7";
  if (d.length > 0) res += " " + d.substring(0, 3);
  if (d.length >= 4) res += " " + d.substring(3, 6);
  if (d.length >= 7) res += " " + d.substring(6, 8);
  if (d.length >= 9) res += " " + d.substring(8, 10);
  return res;
};

// Только цифры для ИНН (максимум 12 символов)
export const formatINN = (val: string): string => {
  return val.replace(/\D/g, "").slice(0, 12);
};