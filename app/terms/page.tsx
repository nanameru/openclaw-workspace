const Page = () => (
  <main className="mx-auto max-w-3xl p-6">
    <h1 className="text-2xl font-bold">利用規約</h1>

    <div className="mt-4 space-y-3 text-zinc-700">
      <p>
        ユーザーは、第三者の著作権・肖像権・商標権その他の権利を侵害しない画像のみをアップロードしてください。
      </p>
      <p>
        本サービスはAI動画生成基盤（Replicate上のPruna AI P-Video）を利用しており、生成結果の品質・正確性・適法性を保証するものではありません。
      </p>
      <p>
        生成された動画は、ユーザー自身の責任で利用・公開してください。公序良俗に反する用途、違法用途、詐欺的な用途は禁止します。
      </p>
      <p>
        表示されるサンプル動画・生成結果は、原則として速度変更や二次編集を行わない出力を前提とします。
      </p>
    </div>
  </main>
);

export default Page;
