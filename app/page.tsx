"use client";

import { useMemo, useState } from "react";

type ApiResult = {
  provider: "youtube" | "x" | "tiktok" | "instagram" | "facebook";
  text: string;
  warnings: string[];
  sourceUrl: string;
};

type HistoryItem = {
  id: string;
  provider: ApiResult["provider"];
  sourceUrl: string;
  createdAt: string;
  textPreview: string;
};

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const providers = ["youtube", "x", "tiktok", "instagram", "facebook"] as const;

const HomePage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const run = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = (await res.json()) as ApiResult & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "失敗しました");
        return;
      }

      setResult(data);
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          provider: data.provider,
          sourceUrl: data.sourceUrl,
          createdAt: new Date().toLocaleString("ja-JP"),
          textPreview: data.text.slice(0, 60)
        },
        ...prev
      ].slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
  };

  const download = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.provider}-transcript.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const statusLabel = useMemo(() => {
    if (loading) return "解析中";
    if (result) return "完了";
    return "待機中";
  }, [loading, result]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-[260px_1fr] lg:p-6">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">JP Transcript</p>
          <h1 className="mt-2 text-xl font-semibold">Link to Text Studio</h1>
          <p className="mt-2 text-sm text-slate-400">動画URLを貼るだけで、文字起こし・コピー・出力まで完了。</p>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
              <span className="text-slate-400">ステータス</span>
              <span className="font-medium">{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
              <span className="text-slate-400">認証</span>
              <span className="font-medium">{clerkEnabled ? "ON" : "OFF"}</span>
            </div>
          </div>

          <h2 className="mt-6 text-xs uppercase tracking-[0.18em] text-slate-500">対応ソース</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {providers.map((provider) => (
              <span key={provider} className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200">
                {provider}
              </span>
            ))}
          </div>

          <h2 className="mt-6 text-xs uppercase tracking-[0.18em] text-slate-500">最近の実行</h2>
          <ul className="mt-2 space-y-2">
            {history.length === 0 ? (
              <li className="rounded-lg border border-slate-800 p-3 text-xs text-slate-500">まだ履歴がありません</li>
            ) : history.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs">
                <div className="font-medium uppercase text-slate-300">{item.provider}</div>
                <div className="mt-1 line-clamp-1 text-slate-400">{item.textPreview || "(空)"}</div>
                <div className="mt-1 text-[11px] text-slate-500">{item.createdAt}</div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:p-7">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">URL入力</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                className="h-12 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm outline-none ring-0 transition focus:border-indigo-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
              <button
                className="h-12 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={run}
                disabled={loading || !url}
              >
                {loading ? "解析中..." : "テキスト化する"}
              </button>
            </div>
            {error ? (
              <p className="mt-3 rounded-lg border border-rose-800 bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Transcript Result</p>
                <p className="mt-1 text-sm text-slate-300">
                  Source: {result?.sourceUrl ?? "未実行"}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={copy} className="rounded-lg border border-slate-600 px-3 py-2 text-sm">Copy</button>
                <button onClick={download} className="rounded-lg border border-slate-600 px-3 py-2 text-sm">Export TXT</button>
              </div>
            </div>

            {result?.warnings?.length ? (
              <ul className="mt-3 list-disc rounded-lg border border-amber-800 bg-amber-950/50 px-5 py-3 text-sm text-amber-200">
                {result.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : null}

            <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {result?.text ?? "ここに文字起こし結果が表示されます。"}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
