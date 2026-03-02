import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "¥0",
    note: "まず試したい個人向け",
    credits: "月30クレジット",
    features: ["透かしあり出力", "最大720p", "コミュニティサポート"]
  },
  {
    name: "Creator",
    price: "¥1,980 / 月",
    note: "SNS運用・副業クリエイター向け",
    credits: "月300クレジット",
    features: ["透かしなし", "最大1080p", "優先キュー", "商用利用可"]
  },
  {
    name: "Studio",
    price: "¥9,800 / 月",
    note: "チーム運用向け",
    credits: "月2,000クレジット",
    features: ["最大4K", "最優先キュー", "チーム管理", "請求書払い対応"]
  }
];

const Page = () => {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold">料金プラン</h1>
        <p className="mt-2 text-zinc-600">すべて税込表示。用途に合わせていつでもプラン変更できます。</p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-violet-700">{plan.name}</p>
              <p className="mt-2 text-2xl font-bold">{plan.price}</p>
              <p className="mt-1 text-sm text-zinc-500">{plan.note}</p>
              <p className="mt-4 rounded-md bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800">{plan.credits}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                {plan.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">クレジット消費ルール（目安）</h2>
          <p className="mt-2 text-sm text-zinc-600">最終的な消費量は混雑状況やモデル更新で変わる場合があります。</p>

          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            <p><span className="font-semibold">基本式:</span> 基本10クレジット × 解像度係数 × 秒数係数</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>解像度係数: 720p = 1.0 / 1080p = 1.8 / 4K = 3.5</li>
              <li>秒数係数: 5秒 = 1.0 / 10秒 = 1.7 / 15秒 = 2.4</li>
              <li>高精細モードON: +20%（係数1.2）</li>
            </ul>
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p className="font-semibold">消費例</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>720p / 5秒: 10クレジット</li>
              <li>1080p / 10秒: 10 × 1.8 × 1.7 = 約31クレジット</li>
              <li>4K / 15秒（高精細ON）: 10 × 3.5 × 2.4 × 1.2 = 約101クレジット</li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-zinc-500">※ 生成失敗時の課金ルールは利用規約およびヘルプで案内します。</p>
        </section>

        <div className="mt-8">
          <Link href="/terms" className="text-sm text-violet-700 underline">利用規約を見る</Link>
        </div>
      </div>
    </main>
  );
};

export default Page;
