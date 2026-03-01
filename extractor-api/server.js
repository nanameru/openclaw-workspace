import express from "express";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import OpenAI from "openai";

const execFileAsync = promisify(execFile);
const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8080);
const API_TOKEN = process.env.EXTRACTOR_API_TOKEN || "";

const requireAuth = (req, res, next) => {
  if (!API_TOKEN) return next();
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${API_TOKEN}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
};

const transcribeWithDeepgram = async (audioPath) => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY missing");

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
    throw new Error(`deepgram_failed:${response.status}`);
  }

  const json = await response.json();
  const text = json?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim();
  if (!text) throw new Error("deepgram_empty");
  return { text, engine: "deepgram", language: json?.results?.channels?.[0]?.detected_language || "auto" };
};

const transcribeWithOpenAI = async (audioPath) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const client = new OpenAI({ apiKey });
  const file = await fs.readFile(audioPath);
  const blob = new Blob([file]);
  const transcript = await client.audio.transcriptions.create({
    file: new File([blob], path.basename(audioPath)),
    model: "gpt-4o-mini-transcribe"
  });

  return { text: transcript.text, engine: "openai", language: "auto" };
};

const transcribeAudio = async (audioPath) => {
  try {
    return await transcribeWithDeepgram(audioPath);
  } catch {
    return await transcribeWithOpenAI(audioPath);
  }
};

const downloadAudio = async (url) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "extractor-"));
  const outPath = path.join(tmpDir, "audio.%(ext)s");

  await execFileAsync("yt-dlp", ["-x", "--audio-format", "mp3", "-o", outPath, url]);

  const files = await fs.readdir(tmpDir);
  const audioFile = files.find((x) => x.startsWith("audio."));
  if (!audioFile) throw new Error("audio_extract_failed");

  return { audioPath: path.join(tmpDir, audioFile), tmpDir };
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "extractor-api" });
});

app.post("/transcribe", requireAuth, async (req, res) => {
  const { provider, url } = req.body || {};
  if (!url) return res.status(400).json({ error: "url_required" });

  let tmpDir = null;
  try {
    const dl = await downloadAudio(url);
    tmpDir = dl.tmpDir;
    const tx = await transcribeAudio(dl.audioPath);

    return res.json({
      provider: provider || "unknown",
      text: tx.text,
      language: tx.language,
      engine: tx.engine,
      warnings: ["extractor-api経由で処理しました"]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "transcribe_failed";
    return res.status(500).json({ error: message });
  } finally {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
});

app.listen(PORT, () => {
  console.log(`extractor-api listening on :${PORT}`);
});
