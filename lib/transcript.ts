import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TranscriptResult } from "@/lib/types";

const execFileAsync = promisify(execFile);
const normalizeText = (input: string): string => input.replace(/\s+/g, " ").trim();

const transcribeWithWhisper = async (audioPath: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY が未設定です");

  const openai = new OpenAI({ apiKey });
  const file = await fs.readFile(audioPath);
  const blob = new Blob([file]);
  const transcript = await openai.audio.transcriptions.create({
    file: new File([blob], path.basename(audioPath)),
    model: "gpt-4o-mini-transcribe"
  });

  return transcript.text;
};

const downloadAudioWithYtDlp = async (url: string): Promise<string> => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "jp-transcript-"));
  const outPath = path.join(tmpDir, "audio.%(ext)s");

  await execFileAsync("yt-dlp", ["-x", "--audio-format", "mp3", "-o", outPath, url]);

  const files = await fs.readdir(tmpDir);
  const audioFile = files.find((x) => x.startsWith("audio."));
  if (!audioFile) throw new Error("音声抽出に失敗しました");

  return path.join(tmpDir, audioFile);
};

export const fetchYouTubeTranscript = async (url: string): Promise<TranscriptResult> => {
  try {
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
  } catch {
    const audioPath = await downloadAudioWithYtDlp(url);
    const text = await transcribeWithWhisper(audioPath);

    return {
      provider: "youtube",
      sourceUrl: url,
      language: "auto",
      text,
      segments: [{ start: 0, dur: 0, text }],
      warnings: ["字幕を取得できなかったため、音声抽出+Whisperでフォールバックしました。"]
    };
  }
};

export const fetchXTranscript = async (url: string): Promise<TranscriptResult> => {
  try {
    const audioPath = await downloadAudioWithYtDlp(url);
    const text = await transcribeWithWhisper(audioPath);

    return {
      provider: "x",
      sourceUrl: url,
      language: "auto",
      text,
      segments: [{ start: 0, dur: 0, text }],
      warnings: ["Xは取得制約により失敗する場合があります。"]
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "X文字起こしに失敗しました";
    return {
      provider: "x",
      sourceUrl: url,
      language: "auto",
      text: "X動画の取得または文字起こしに失敗しました。",
      segments: [{ start: 0, dur: 0, text: "失敗" }],
      warnings: [message, "yt-dlpとOPENAI_API_KEYを確認してください。"]
    };
  }
};
