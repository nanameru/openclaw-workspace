import Link from "next/link";
import { GeneratorPanel } from "@/components/generator-panel";

const kpis = [
  { label: "生成中", value: "3" },
  { label: "本日完了", value: "27" },
  { label: "平均生成時間", value: "54秒" },
  { label: "今月クレジット", value: "1,240" },
];

const DashboardPage = () => {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto grid max-w-7xl md:grid-cols-[260px_1fr]">
        <aside className="hidden min-h-screen border-r border-zinc-200 bg-white p-4 md:block">
          <Link href="/" className="text-lg font-semibold text-violet-700">Photo to Life JP</Link>
          <button className="mt-6 w-full rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">+ 新規プロジェクト</button>
          <nav className="mt-6 space-y-1 text-sm">
            {[
              "ダッシュボード",
              "画像アップロード",
              "生成ジョブ",
              "書き出し履歴",
              "テンプレート",
              "請求",
              "設定",
            ].map((item, idx) => (
              <a
                key={item}
                href="#"
                className={`block rounded-md px-3 py-2 ${idx === 0 ? "bg-zinc-100 font-semibold text-zinc-900" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="p-4 md:p-8">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ダッシュボード</h1>
              <p className="text-sm text-zinc-500">画像アニメーション生成の進捗</p>
            </div>
            <Link href="/" className="text-sm text-violet-700">LPへ戻る</Link>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-sm text-zinc-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="font-semibold">最近の生成</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="py-2">ジョブID</th>
                      <th className="py-2">テンプレート</th>
                      <th className="py-2">ステータス</th>
                      <th className="py-2">出力</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["job_214", "cinematic-pan", "running", "-"],
                      ["job_213", "portrait-smile", "done", "mp4"],
                      ["job_212", "anime-zoom", "failed", "0"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-t border-zinc-100">
                        {row.map((col) => (
                          <td key={col} className="py-3">{col}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <GeneratorPanel />
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
