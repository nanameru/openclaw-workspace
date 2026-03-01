export const detectProvider = (url: string): "youtube" | "x" | null => {
  const value = url.toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  if (value.includes("x.com") || value.includes("twitter.com")) return "x";
  return null;
};

export const safeUrl = (raw: string): string => {
  try {
    const u = new URL(raw.trim());
    return u.toString();
  } catch {
    throw new Error("URL形式が不正です");
  }
};
