const apiKeyInput = document.getElementById("apiKey");
const tweetUrlInput = document.getElementById("tweetUrl");
const runBtn = document.getElementById("runBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const originalTextEl = document.getElementById("originalText");
const jaTextEl = document.getElementById("jaText");
const imagesEl = document.getElementById("images");

const setStatus = (text) => {
  statusEl.textContent = text;
};

const extractFromOEmbedHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const p = doc.querySelector("p");
  const text = p ? p.textContent?.trim() ?? "" : "";
  const imgMatches = [...html.matchAll(/https:\/\/pbs\.twimg\.com\/[^\"'\s]+/g)];
  const unique = [...new Set(imgMatches.map((m) => m[0]))];
  return { text, images: unique };
};

const fetchTweetData = async (tweetUrl) => {
  const url = `https://publish.twitter.com/oembed?omit_script=true&url=${encodeURIComponent(tweetUrl)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`取得失敗: ${res.status}`);
  }
  const data = await res.json();
  const parsed = extractFromOEmbedHtml(data.html ?? "");
  const thumbnail = typeof data.thumbnail_url === "string" ? [data.thumbnail_url] : [];
  const images = [...new Set([...parsed.images, ...thumbnail])];

  return {
    text: parsed.text,
    images
  };
};

const translateToJapanese = async (apiKey, text) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a translation engine. Translate to natural Japanese. Return only translated text." },
        { role: "user", content: text }
      ],
      temperature: 0
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`翻訳API失敗: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
};

const renderImages = (urls) => {
  imagesEl.innerHTML = "";
  urls.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "tweet image";
    imagesEl.appendChild(img);
  });
};

const loadSavedKey = async () => {
  const saved = await chrome.storage.local.get(["openaiApiKey"]);
  if (typeof saved.openaiApiKey === "string") {
    apiKeyInput.value = saved.openaiApiKey;
  }
};

runBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const tweetUrl = tweetUrlInput.value.trim();

  if (!apiKey || !tweetUrl) {
    setStatus("APIキーとURLを入力してください。");
    return;
  }

  setStatus("取得中...");
  resultEl.style.display = "none";

  try {
    await chrome.storage.local.set({ openaiApiKey: apiKey });

    const tweet = await fetchTweetData(tweetUrl);
    if (!tweet.text) {
      throw new Error("本文を抽出できませんでした");
    }

    setStatus("翻訳中...");
    const ja = await translateToJapanese(apiKey, tweet.text);

    originalTextEl.textContent = tweet.text;
    jaTextEl.textContent = ja || "翻訳結果が空でした。";
    renderImages(tweet.images);
    resultEl.style.display = "block";
    setStatus("完了");
  } catch (error) {
    const message = error instanceof Error ? error.message : "失敗しました";
    setStatus(message);
  }
});

loadSavedKey().catch(() => {
  setStatus("APIキー読み込み失敗");
});
