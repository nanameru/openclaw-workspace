import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptResult } from "@/lib/types";

const normalizeText = (input: string): string => input.replace(/\s+/g, " ").trim();

export const fetchYouTubeTranscript = async (url: string): Promise<TranscriptResult> => {
  const rows = await YoutubeTranscript.fetchTranscript(url);
  const segments = rows.map((row) => ({
    start: row.offset,
    dur: row.duration,
    text: normalizeText(row.text)
  }));
  const text = segments.map((x) => x.text).join("\n");

  return {
    provider: "youtube",
    sourceUrl: url,
    language: "auto",
    text,
    segments,
    warnings: []
  };
};

export const fetchXTranscript = async (url: string): Promise<TranscriptResult> => {
  return {
    provider: "x",
    sourceUrl: url,
    language: "auto",
    text: "X動画は取得制約があるため、現在はベータ対応です。\nサーバー側にyt-dlp + Whisper導入時に有効化してください。",
    segments: [
      { start: 0, dur: 0, text: "X動画は現在ベータ対応" }
    ],
    warnings: ["Xはプラットフォーム仕様上、URL直接抽出が失敗する場合があります。"]
  };
};
