// Автоматическая капитализация каждого слова (для ФИО, сотрудников)
export const formatCapitalizeWords = (val: string): string => {
  return val.replace(/(^|[\s\-])([a-zа-яё])/gu, (_, sep, char) => sep + char.toUpperCase());
};

// Автоматическая капитализация первой буквы (для городов, названий)
export const formatCapitalizeFirst = (val: string): string => {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
};

// Российская маска телефона: +7 (XXX) XXX-XX-XX
export const formatPhone = (val: string): string => {
  if (!val) return "";
  let digits = val.replace(/\D/g, "");

  // Если номер начинается с 7 или 8, отсекаем префикс для форматирования
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }

  // Ограничиваем 10 цифрами после кода страны
  digits = digits.slice(0, 10);

  let formatted = "+7";
  if (digits.length > 0) {
    formatted += " (" + digits.slice(0, 3);
  }
  if (digits.length >= 4) {
    formatted += ") " + digits.slice(3, 6);
  }
  if (digits.length >= 7) {
    formatted += "-" + digits.slice(6, 8);
  }
  if (digits.length >= 9) {
    formatted += "-" + digits.slice(8, 10);
  }

  return formatted;
};

// Только цифры для ИНН (максимум 12 символов)
export const formatINN = (val: string): string => {
  return val.replace(/\D/g, "").slice(0, 12);
};