import Link from "next/link";

const features = [
  {
    title: "1枚の写真から短い動画へ",
    body: "人物・風景写真をアップロードすると、動き付きのショート動画を自動生成します。",
  },
  {
    title: "日本語プロンプト最適化",
    body: "日本語の意図を崩さず、自然な動きになるように自動で補正します。",
  },
  {
    title: "SNS投稿まで最短",
    body: "縦動画(9:16)・正方形(1:1)に対応。書き出し後すぐに投稿できます。",
  },
];

const HomePage = () => {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-violet-700">Photo to Life JP</Link>
          <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
            <a href="#features">機能</a>
            <a href="#pricing">料金</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/help" className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">ヘルプ</Link>
            <Link href="/dashboard" className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">作成を開始</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">日本向けローカライズ版</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">思い出の1枚を、動き出す動画に。</h1>
          <p className="mt-4 text-zinc-600">bringmyphototolifeの体験をベースに、日本語UI・日本向け導線・法務ページを整えた独自実装です。</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-md bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700">無料で試す</Link>
            <Link href="/about" className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100">サービス詳細</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-zinc-700">生成ジョブ（サンプル）</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-zinc-200 p-3">
              <p className="font-medium">家族写真 → シネマ風</p>
              <p className="mt-1 text-xs text-zinc-500">ステータス: 生成中 / 残り約 48秒</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3">
              <p className="font-medium">旅先の風景 → ドローン風パン</p>
              <p className="mt-1 text-xs text-zinc-500">ステータス: 完了 / MP4(9:16)</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3">
              <p className="font-medium">プロフィール写真 → 微笑みアニメーション</p>
              <p className="mt-1 text-xs text-zinc-500">ステータス: レビュー待ち</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">主要機能</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((item) => (
            <article key={item.title} className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">料金プラン（税込）</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Starter", "¥0"],
            ["Creator", "¥1,980 / 月"],
            ["Studio", "要お問い合わせ"],
          ].map(([name, price]) => (
            <div key={name} className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="font-semibold">{name}</p>
              <p className="mt-2 text-2xl font-bold">{price}</p>
              <Link href="/terms" className="mt-4 inline-block text-sm text-violet-700">利用条件を見る →</Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-zinc-600">
          <p>© Photo to Life JP</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/about">about</Link>
            <Link href="/help">help</Link>
            <Link href="/terms">terms</Link>
            <Link href="/privacy">privacy</Link>
            <Link href="/legal">legal</Link>
            <Link href="/status">status</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
