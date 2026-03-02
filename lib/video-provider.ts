type ProviderJobStatus = "queued" | "running" | "done" | "failed";

export type ProviderCreateResult = {
  providerJobId: string;
  providerStatus: ProviderJobStatus;
  statusUrl?: string;
};

export type ProviderStatusResult = {
  providerStatus: ProviderJobStatus;
  outputUrl?: string;
  errorMessage?: string;
};

const REPLICATE_API = "https://api.replicate.com/v1";

const getReplicateConfig = () => {
  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_MODEL_VERSION;

  if (!token) throw new Error("REPLICATE_API_TOKEN が未設定です。");
  if (!version) throw new Error("REPLICATE_MODEL_VERSION が未設定です。");

  return { token, version };
};

const toProviderStatus = (raw: string): ProviderJobStatus => {
  if (raw === "starting" || raw === "processing") return "running";
  if (raw === "succeeded") return "done";
  if (raw === "failed" || raw === "canceled") return "failed";
  return "queued";
};

const classifyError = (message: string): string => {
  if (message.includes("401") || message.includes("403")) return "動画生成APIの認証に失敗しました。APIキー設定を確認してください。";
  if (message.includes("429")) return "動画生成APIが混雑しています。しばらく待って再試行してください。";
  if (message.includes("413")) return "画像サイズが大きすぎます。軽量化して再試行してください。";
  return `動画生成基盤エラー: ${message}`;
};

export const createProviderJob = async ({
  prompt,
  imageDataUrl,
  aspectRatio
}: {
  prompt: string;
  imageDataUrl: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
}): Promise<ProviderCreateResult> => {
  const { token, version } = getReplicateConfig();

  const res = await fetch(`${REPLICATE_API}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version,
      input: {
        prompt,
        image: imageDataUrl,
        aspect_ratio: aspectRatio
      }
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(classifyError(`${res.status} ${body}`));
  }

  const data = (await res.json()) as { id: string; status: string; urls?: { get?: string } };

  return {
    providerJobId: data.id,
    providerStatus: toProviderStatus(data.status),
    statusUrl: data.urls?.get
  };
};

export const getProviderJobStatus = async ({
  providerJobId
}: {
  providerJobId: string;
}): Promise<ProviderStatusResult> => {
  const { token } = getReplicateConfig();

  const res = await fetch(`${REPLICATE_API}/predictions/${providerJobId}`, {
    headers: {
      Authorization: `Token ${token}`
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(classifyError(`${res.status} ${body}`));
  }

  const data = (await res.json()) as {
    status: string;
    output?: string | string[];
    error?: string;
  };

  const outputValue = Array.isArray(data.output) ? data.output[0] : data.output;

  return {
    providerStatus: toProviderStatus(data.status),
    outputUrl: typeof outputValue === "string" ? outputValue : undefined,
    errorMessage: data.error
  };
};
