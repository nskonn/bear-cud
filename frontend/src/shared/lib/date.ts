export const isToday = (dateString: string) => {
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

export const isThisWeek = (dateString: string) => {
  const d = new Date(dateString);
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay() || 7; 
  if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
};

export const isThisMonth = (dateString: string) => {
  const d = new Date(dateString);
  const today = new Date();
  return d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

export const getLocalYYYYMMDD = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekStart = (dateString: string) => {
  const d = new Date(dateString);
  const day = d.getDay() || 7; 
  d.setDate(d.getDate() - day + 1);
  return getLocalYYYYMMDD(d);
};

export const getWeekRangeStr = (startDateStr: string) => {
  const d = new Date(startDateStr);
  const startStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  d.setDate(d.getDate() + 6);
  const endStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  return `${startStr} - ${endStr}`;
};

export const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const SHORT_MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
