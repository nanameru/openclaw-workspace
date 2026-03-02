const Page = () => (
  <main className="mx-auto max-w-3xl p-6">
    <h1 className="text-2xl font-bold">Help</h1>
    <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700">
      <li>画像をアップロードします（推奨: 1080px以上）。</li>
      <li>動きのイメージを日本語で入力します（例: ゆっくりズームイン）。</li>
      <li>比率（9:16 / 1:1 / 16:9）を選んで生成を実行します。</li>
      <li>プレビュー確認後にMP4を書き出します。</li>
    </ol>
  </main>
);

export default Page;
