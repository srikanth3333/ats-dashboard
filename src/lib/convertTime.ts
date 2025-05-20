import { parseISO } from "date-fns";

export function convertToIndianTime(dateStr: string) {
  try {
    const parsedDate = parseISO(dateStr);
    return parsedDate;
  } catch (error) {
    console.error("Invalid date format:", dateStr);
    return new Date(); // Fallback to current date
  }
}
