const Page = () => (
  <main className="mx-auto max-w-3xl p-6">
    <h1 className="text-2xl font-bold">Status</h1>
    <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-700">
      <li>サービス状態: 稼働中</li>
      <li>画像生成キュー: 混雑なし</li>
      <li>書き出し機能: 正常</li>
    </ul>
  </main>
);

export default Page;
