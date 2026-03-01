export type TranscriptProvider = "youtube" | "x" | "tiktok" | "instagram" | "facebook";

export type TranscriptSegment = {
  start: number;
  dur: number;
  text: string;
};

export type TranscriptResult = {
  provider: TranscriptProvider;
  sourceUrl: string;
  language: string;
  text: string;
  segments: TranscriptSegment[];
  warnings: string[];
};
