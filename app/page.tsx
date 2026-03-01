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
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                JP Transcript
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                YouTube / X URL から
                <br className="hidden md:block" />
                文字起こしをワンクリック取得
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                URLを貼って実行するだけ。取得したテキストはそのままコピー・TXT保存できます。
              </p>
            </div>
            <span className="h-fit rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {clerkEnabled ? "認証ON" : "認証OFF（環境変数未設定）"}
            </span>
          </div>

          <div className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <label htmlFor="url" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Video URL
              </label>
              <input
                id="url"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <button
              className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={run}
              disabled={loading || !url}
            >
              {loading ? "処理中..." : "文字起こし開始"}
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1">高速取得</span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1">TXTエクスポート</span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1">利用規約・著作権順守</span>
          </div>
        </section>

        {result ? (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Transcript Result</p>
                <p className="mt-1 text-sm text-slate-600">Source: {result.sourceUrl}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={copy}
                >
                  Copy
                </button>
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={download}
                >
                  Export TXT
                </button>
              </div>
            </div>

            {result.warnings?.length ? (
              <ul className="mt-4 list-disc rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}

            <pre className="mt-4 max-h-[30rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
              {result.text}
            </pre>
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default HomePage;
