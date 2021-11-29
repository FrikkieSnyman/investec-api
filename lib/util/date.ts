export const getDateISO8601String = (date: Date): string =>
  date.toISOString().split("T")[0];
