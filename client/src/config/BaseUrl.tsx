export const BASE_URL: string =
  (import.meta.env.VITE_BASE_URL as string) || "http://localhost:5000";

/**
 * Returns a normalized, safe image URL preventing double slashes or missing base URLs.
 */
export const getImageUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};
