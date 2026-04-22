import { format, parseISO, differenceInDays } from "date-fns";

export function formatCurrency(amount: number | null | undefined, currency = "USD"): string {
  if (amount == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateRange(startStr: string, endStr: string): string {
  try {
    return `${format(parseISO(startStr), "MMM d")} – ${format(parseISO(endStr), "MMM d, yyyy")}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
}

export function formatDayDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, MMMM d");
  } catch {
    return dateStr;
  }
}

export function tripDurationLabel(startStr: string, endStr: string): string {
  try {
    const days = differenceInDays(parseISO(endStr), parseISO(startStr)) + 1;
    return `${days} ${days === 1 ? "day" : "days"}`;
  } catch {
    return "";
  }
}

export function weatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function rainLabel(probability: number): string {
  return `${Math.round((probability || 0) * 100)}% rain`;
}
