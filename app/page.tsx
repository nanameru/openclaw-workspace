"use client";

import { useState } from "react";

type ApiResult = {
  provider: "youtube" | "x" | "tiktok" | "instagram" | "facebook";
  text: string;
  warnings: string[];
  sourceUrl: string;
};

const providers = ["YouTube", "Instagram", "TikTok", "X", "Facebook", "Vimeo", "Loom"];

const HomePage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);

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

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <p className="text-lg font-semibold">JP Transcript</p>
            <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
              <span>機能</span>
              <span>ソリューション</span>
              <span>リソース</span>
              <span>料金</span>
            </nav>
          </div>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">始める</button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-center text-3xl font-bold tracking-tight md:text-4xl">URLを貼るだけで即文字起こし</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 md:text-base">
          動画・投稿リンクからテキストを抽出。コピー、TXT出力までワンストップで完結。
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-bold text-fuchsia-500">95%+</p>
            <p className="mt-1 text-xs text-slate-500">文字起こし精度</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-bold text-fuchsia-500">&lt;1min</p>
            <p className="mt-1 text-xs text-slate-500">平均処理時間</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-bold text-fuchsia-500">200万+</p>
            <p className="mt-1 text-xs text-slate-500">文字起こし実行数</p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div className="mx-auto inline-flex rounded-xl bg-slate-100 p-1 text-sm">
            <button className="rounded-lg px-4 py-2 text-slate-500">音声ファイル</button>
            <button className="rounded-lg bg-white px-4 py-2 font-medium shadow">リンク</button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <p className="text-center text-base font-semibold">動画またはポストのリンクを貼り付け</p>
            <p className="mt-1 text-center text-sm text-slate-500">{providers.join("、")} など対応</p>

            <input
              className="mt-4 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-fuchsia-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://x.com/user/status/..."
            />

            <select className="mt-3 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-fuchsia-400" defaultValue="auto">
              <option value="auto">自動検出（推奨）</option>
              <option value="ja">日本語</option>
              <option value="en">英語</option>
            </select>

            <button
              className="mt-4 h-12 w-full rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={run}
              disabled={loading || !url}
            >
              {loading ? "文字起こし中..." : "文字起こし開始"}
            </button>

            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>

        {result ? (
          <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Source: {result.sourceUrl}</p>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={copy}>Copy</button>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={download}>Export TXT</button>
              </div>
            </div>

            {result.warnings?.length ? (
              <ul className="mt-3 list-disc rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
                {result.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : null}

            <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
              {result.text}
            </pre>
          </section>
        ) : null}
      </section>
    </main>
  );
};

export default HomePage;
