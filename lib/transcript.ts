import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TranscriptResult } from "@/lib/types";
import type { SupportedProvider } from "@/lib/url";

const execFileAsync = promisify(execFile);
const normalizeText = (input: string): string => input.replace(/\s+/g, " ").trim();

const REMOTE_EXTRACTOR_URL = process.env.EXTRACTOR_API_URL;
const REMOTE_EXTRACTOR_TOKEN = process.env.EXTRACTOR_API_TOKEN;

type RemoteTranscriptResponse = {
  text: string;
  language?: string;
  engine?: string;
  warnings?: string[];
};

const fetchRemoteTranscript = async (
  provider: SupportedProvider,
  url: string
): Promise<TranscriptResult | null> => {
  if (!REMOTE_EXTRACTOR_URL) return null;

  const res = await fetch(`${REMOTE_EXTRACTOR_URL.replace(/\/$/, "")}/transcribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(REMOTE_EXTRACTOR_TOKEN ? { Authorization: `Bearer ${REMOTE_EXTRACTOR_TOKEN}` } : {})
    },
    body: JSON.stringify({ provider, url })
  });

  if (!res.ok) {
    throw new Error(`remote_extractor_failed:${res.status}`);
  }

  const data = (await res.json()) as RemoteTranscriptResponse;
  return {
    provider,
    sourceUrl: url,
    language: data.language ?? "auto",
    text: data.text,
    segments: [{ start: 0, dur: 0, text: data.text }],
    warnings: data.warnings ?? ["Railway extractor経由で文字起こししました。"]
  };
};

const transcribeWithDeepgram = async (audioPath: string): Promise<string> => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY が未設定です");

  const file = await fs.readFile(audioPath);
  const blob = new Blob([file], { type: "audio/mpeg" });
  const form = new FormData();
  form.append("audio", blob, path.basename(audioPath));

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&detect_language=true",
    {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}` },
      body: form
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Deepgram失敗: ${response.status} ${body}`);
  }

  const json = (await response.json()) as {
    results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
  };

  const text = json.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim();
  if (!text) throw new Error("Deepgram結果が空です");
  return text;
};

const transcribeWithOpenAI = async (audioPath: string): Promise<string> => {
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

const transcribeAudio = async (audioPath: string): Promise<{ text: string; provider: string }> => {
  try {
    const text = await transcribeWithDeepgram(audioPath);
    return { text, provider: "deepgram" };
  } catch {
    const text = await transcribeWithOpenAI(audioPath);
    return { text, provider: "openai" };
  }
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
    const remote = await fetchRemoteTranscript("youtube", url).catch(() => null);
    if (remote) {
      return {
        ...remote,
        warnings: ["字幕取得に失敗したためRailway extractorにフォールバックしました。", ...remote.warnings]
      };
    }

    const audioPath = await downloadAudioWithYtDlp(url);
    const { text, provider } = await transcribeAudio(audioPath);

    return {
      provider: "youtube",
      sourceUrl: url,
      language: "auto",
      text,
      segments: [{ start: 0, dur: 0, text }],
      warnings: [`字幕を取得できなかったため、${provider}でフォールバックしました。`]
    };
  }
};

export const fetchXTranscript = async (url: string): Promise<TranscriptResult> => {
  try {
    const remote = await fetchRemoteTranscript("x", url).catch(() => null);
    if (remote) return remote;

    const audioPath = await downloadAudioWithYtDlp(url);
    const { text, provider } = await transcribeAudio(audioPath);

    return {
      provider: "x",
      sourceUrl: url,
      language: "auto",
      text,
      segments: [{ start: 0, dur: 0, text }],
      warnings: [`Xは取得制約により失敗する場合があります。転写: ${provider}`]
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "X文字起こしに失敗しました";
    const isYtDlpMissing = message.includes("ENOENT") || message.includes("yt-dlp");

    return {
      provider: "x",
      sourceUrl: url,
      language: "auto",
      text: "X動画の取得または文字起こしに失敗しました。",
      segments: [{ start: 0, dur: 0, text: "失敗" }],
      warnings: isYtDlpMissing
        ? ["現在のサーバー環境でX動画取得設定が不足しています。運用環境にyt-dlpを導入して再実行してください。"]
        : ["X動画の取得または文字起こしに失敗しました。時間をおいて再試行してください。"]
    };
  }
};

export const fetchGenericTranscript = async (
  socialProvider: Exclude<SupportedProvider, "youtube" | "x">,
  url: string
): Promise<TranscriptResult> => {
  try {
    const remote = await fetchRemoteTranscript(socialProvider, url).catch(() => null);
    if (remote) return remote;

    const audioPath = await downloadAudioWithYtDlp(url);
    const { text, provider } = await transcribeAudio(audioPath);

    return {
      provider: socialProvider,
      sourceUrl: url,
      language: "auto",
      text,
      segments: [{ start: 0, dur: 0, text }],
      warnings: [`${socialProvider}は取得制約により失敗する場合があります。転写: ${provider}`]
    };
  } catch {
    return {
      provider: socialProvider,
      sourceUrl: url,
      language: "auto",
      text: `${socialProvider}動画の取得または文字起こしに失敗しました。`,
      segments: [{ start: 0, dur: 0, text: "失敗" }],
      warnings: ["このURLは現在のサーバー環境では取得できない可能性があります。別URLで再試行してください。"]
    };
  }
};
