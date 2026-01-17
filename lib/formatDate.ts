
export function formatDate(dateValue: string | Date) {
    const date = new Date(dateValue);
  
    if (isNaN(date.getTime())) return "Invalid date";
  
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  