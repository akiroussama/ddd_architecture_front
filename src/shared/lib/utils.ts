import { clsx, type ClassValue } from "clsx"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: string | number | Date) {
  if (!date) return "—"
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: fr
    })
  } catch (error) {
    console.error("formatRelativeDate error", error)
    return "—"
  }
}

export function formatDate(date: string | number | Date, pattern = "dd MMM yyyy") {
  if (!date) return "—"
  try {
    return format(new Date(date), pattern, { locale: fr })
  } catch (error) {
    console.error("formatDate error", error)
    return "—"
  }
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}
