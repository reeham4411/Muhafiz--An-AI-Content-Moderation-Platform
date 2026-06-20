import { format, formatDistanceToNow } from "date-fns";

export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getImageUrl(filePath: string): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  // backend stores absolute disk paths; normalize to the /uploads static route
  const fileName = filePath.split(/[\\/]/).pop();
  return `${API_URL}/uploads/${fileName}`;
}
