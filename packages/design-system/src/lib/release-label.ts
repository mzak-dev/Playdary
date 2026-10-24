const DAY = 86_400_000;

export const daysUntilLabel = (releaseDate: number | null) => {
  if (!releaseDate) return "TBA";
  const days = Math.ceil((releaseDate - Date.now()) / DAY);
  return days > 0 ? `za ${days} d` : "dostępna";
};
