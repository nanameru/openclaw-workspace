"use client";

import { useState } from "react";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type ApiResult = {
  text: string;
  warnings: string[];
  sourceUrl: string;
};

const HomePage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);

  const run = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = (await res.json()) as ApiResult & { error?: string };

    if (!res.ok) {
      setError(data.error ?? "失敗しました");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
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
    a.download = "transcript.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">動画リンク文字起こし（YouTube / X）</h1>
        <div>
          <span className="rounded border px-3 py-1 text-xs text-slate-600">
            {clerkEnabled ? "認証ON" : "認証OFF（環境変数未設定）"}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600">独自実装版MVP。利用規約・著作権を遵守してご利用ください。</p>

      <div className="mt-6 rounded-xl bg-white p-4 shadow">
        <input
          className="w-full rounded border p-3"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <button
          className="mt-3 rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          onClick={run}
          disabled={loading || !url}
        >
          {loading ? "処理中..." : "文字起こし開始"}
        </button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      {result ? (
        <section className="mt-6 rounded-xl bg-white p-4 shadow">
          <p className="text-xs text-slate-500">Source: {result.sourceUrl}</p>
          {result.warnings?.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-amber-700">
              {result.warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          ) : null}
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm">{result.text}</pre>
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-3 py-1" onClick={copy}>Copy</button>
            <button className="rounded border px-3 py-1" onClick={download}>Export TXT</button>
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default HomePage;
