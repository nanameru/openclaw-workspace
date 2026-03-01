export type SupportedProvider = "youtube" | "x" | "tiktok" | "instagram" | "facebook";

export const detectProvider = (url: string): SupportedProvider | null => {
  const value = url.toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  if (value.includes("x.com") || value.includes("twitter.com")) return "x";
  if (value.includes("tiktok.com")) return "tiktok";
  if (value.includes("instagram.com")) return "instagram";
  if (value.includes("facebook.com") || value.includes("fb.watch")) return "facebook";
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
