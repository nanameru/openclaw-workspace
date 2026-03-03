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
        {
          role: "system",
          content:
            "You are a translation engine. Translate to natural Japanese. Return only translated text."
        },
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "translate") {
    return false;
  }

  const run = async () => {
    const saved = await chrome.storage.local.get(["openaiApiKey"]);
    const apiKey = saved.openaiApiKey;

    if (typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error("APIキーが未設定です。ポップアップで設定してください。");
    }

    const text = typeof message.text === "string" ? message.text.trim() : "";
    if (!text) {
      throw new Error("翻訳対象テキストが空です。");
    }

    const translated = await translateToJapanese(apiKey, text);
    return translated || "翻訳結果が空でした。";
  };

  run()
    .then((translated) => sendResponse({ ok: true, translated }))
    .catch((error) => {
      const message = error instanceof Error ? error.message : "翻訳失敗";
      sendResponse({ ok: false, error: message });
    });

  return true;
});
