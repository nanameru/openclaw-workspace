const TRANSLATE_BUTTON_CLASS = "x-jp-translate-btn";
const RESULT_CLASS = "x-jp-translate-result";

const createTranslateButton = () => {
  const button = document.createElement("button");
  button.className = TRANSLATE_BUTTON_CLASS;
  button.textContent = "日本語訳";
  button.style.marginTop = "8px";
  button.style.padding = "4px 8px";
  button.style.borderRadius = "999px";
  button.style.border = "1px solid rgb(83, 100, 113)";
  button.style.background = "transparent";
  button.style.color = "rgb(113, 118, 123)";
  button.style.cursor = "pointer";
  button.style.fontSize = "12px";
  return button;
};

const createResultBlock = () => {
  const block = document.createElement("div");
  block.className = RESULT_CLASS;
  block.style.marginTop = "8px";
  block.style.padding = "8px";
  block.style.border = "1px solid rgba(29, 155, 240, 0.4)";
  block.style.borderRadius = "8px";
  block.style.fontSize = "14px";
  block.style.whiteSpace = "pre-wrap";
  return block;
};

const extractTweetText = (article) => {
  const textNode = article.querySelector('[data-testid="tweetText"]');
  return textNode?.innerText?.trim() ?? "";
};

const requestTranslation = (text) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "translate", text }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response?.ok) {
        reject(new Error(response?.error || "翻訳失敗"));
        return;
      }

      resolve(response.translated);
    });
  });
};

const attachTranslator = (article) => {
  if (article.dataset.jpTranslatorBound === "1") {
    return;
  }

  const text = extractTweetText(article);
  if (!text) {
    return;
  }

  const actionHost = article.querySelector('[role="group"]');
  if (!actionHost) {
    return;
  }

  const button = createTranslateButton();
  const result = createResultBlock();
  result.style.display = "none";

  button.addEventListener("click", async () => {
    button.disabled = true;
    const previous = button.textContent;
    button.textContent = "翻訳中...";

    try {
      const translated = await requestTranslation(text);
      result.textContent = translated;
      result.style.display = "block";
      button.textContent = "再翻訳";
    } catch (error) {
      const message = error instanceof Error ? error.message : "翻訳失敗";
      result.textContent = `エラー: ${message}`;
      result.style.display = "block";
      button.textContent = previous || "日本語訳";
    } finally {
      button.disabled = false;
    }
  });

  actionHost.parentElement?.appendChild(button);
  actionHost.parentElement?.appendChild(result);
  article.dataset.jpTranslatorBound = "1";
};

const scan = () => {
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  articles.forEach((article) => attachTranslator(article));
};

const observer = new MutationObserver(() => scan());
observer.observe(document.body, { childList: true, subtree: true });
scan();
