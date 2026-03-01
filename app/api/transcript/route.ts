import { NextResponse } from "next/server";
import { detectProvider, safeUrl } from "@/lib/url";
import { fetchYouTubeTranscript, fetchXTranscript } from "@/lib/transcript";

type Body = { url?: string };

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as Body;
    if (!body.url) {
      return NextResponse.json({ error: "urlは必須です" }, { status: 400 });
    }

    const normalized = safeUrl(body.url);
    const provider = detectProvider(normalized);

    if (!provider) {
      return NextResponse.json({ error: "YouTube/XのURLのみ対応" }, { status: 400 });
    }

    const result = provider === "youtube"
      ? await fetchYouTubeTranscript(normalized)
      : await fetchXTranscript(normalized);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "処理に失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
