"use client";

import { useMemo, useState } from "react";

type JobStatus = "queued" | "running" | "done" | "failed";
type Seconds = "5" | "10" | "15";
type Resolution = "720p" | "1080p" | "4k";

const statusLabel: Record<JobStatus, string> = {
  queued: "待機中",
  running: "生成中",
  done: "完了",
  failed: "失敗"
};

const resolutionFactor: Record<Resolution, number> = {
  "720p": 1.0,
  "1080p": 1.8,
  "4k": 3.5
};

const secondsFactor: Record<Seconds, number> = {
  "5": 1.0,
  "10": 1.7,
  "15": 2.4
};

export const GeneratorPanel = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("被写体に自然なカメラズームを追加");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [seconds, setSeconds] = useState<Seconds>("5");
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [highQuality, setHighQuality] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const estimatedCredits = useMemo(() => {
    const base = 10;
    const q = highQuality ? 1.2 : 1.0;
    return Math.round(base * resolutionFactor[resolution] * secondsFactor[seconds] * q);
  }, [resolution, seconds, highQuality]);

  const canSubmit = useMemo(() => !!image && !!prompt.trim() && !loading, [image, prompt, loading]);

  const startJob = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    setOutputUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("prompt", prompt.trim());
      formData.append("aspectRatio", aspectRatio);

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = (await res.json()) as { jobId?: string; status?: JobStatus; error?: string };

      if (!res.ok || !data.jobId || !data.status) {
        throw new Error(data.error ?? "ジョブ作成に失敗しました。");
      }

      setJobId(data.jobId);
      setStatus(data.status);
      pollJob(data.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ジョブ作成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const pollJob = async (id: string) => {
    while (true) {
      const res = await fetch(`/api/generate/${id}`, { cache: "no-store" });
      const data = (await res.json()) as { status?: JobStatus; outputUrl?: string | null; error?: string; errorMessage?: string | null };

      if (!res.ok || !data.status) {
        setError(data.error ?? "ジョブ状態の取得に失敗しました。");
        return;
      }

      setStatus(data.status);
      if (data.status === "done") {
        setOutputUrl(data.outputUrl ?? null);
        return;
      }

      if (data.status === "failed") {
        setError(data.errorMessage ?? "動画生成に失敗しました。入力内容を見直して再試行してください。");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="font-semibold">画像から動画を生成</h2>
      <div className="mt-3 space-y-3 text-sm">
        <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          基盤モデル: Pruna AI P-Video (Replicate) / 出力動画は速度変更・追加編集なし
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="block w-full rounded-md border border-zinc-300 px-3 py-2"
        />

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          rows={3}
          placeholder="例: 顔に寄りながら背景をゆっくりパン"
        />

        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as "9:16" | "1:1" | "16:9")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        >
          <option value="9:16">9:16（ショート動画）</option>
          <option value="1:1">1:1（正方形）</option>
          <option value="16:9">16:9（横動画）</option>
        </select>

        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4k">4K</option>
          </select>

          <select
            value={seconds}
            onChange={(e) => setSeconds(e.target.value as Seconds)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="5">5秒</option>
            <option value="10">10秒</option>
            <option value="15">15秒</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-zinc-700">
          <input type="checkbox" checked={highQuality} onChange={(e) => setHighQuality(e.target.checked)} />
          高精細モード（+20%）
        </label>

        <p className="rounded-md bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800">
          この設定の想定消費: 約 {estimatedCredits} クレジット
        </p>

        <button
          onClick={startJob}
          disabled={!canSubmit}
          className="w-full rounded-md bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "送信中..." : "生成を開始"}
        </button>

        {jobId && status && (
          <p className="text-zinc-600">
            ジョブID: <span className="font-mono">{jobId}</span> / 状態: {statusLabel[status]}
          </p>
        )}

        {outputUrl && (
          <a href={outputUrl} className="inline-block text-violet-700 underline">
            生成結果を確認
          </a>
        )}

        {error && <p className="text-red-600">{error}</p>}
      </div>
    </section>
  );
};
