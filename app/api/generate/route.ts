import { NextResponse } from "next/server";
import { createVideoJob } from "@/lib/video-jobs";

const isAllowedAspectRatio = (value: string): value is "9:16" | "1:1" | "16:9" => {
  return value === "9:16" || value === "1:1" || value === "16:9";
};

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const prompt = String(formData.get("prompt") ?? "").trim();
    const aspectRatioRaw = String(formData.get("aspectRatio") ?? "9:16");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "画像形式のファイルのみ対応しています。" }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "動きの説明を入力してください。" }, { status: 400 });
    }

    if (prompt.length > 280) {
      return NextResponse.json({ error: "プロンプトは280文字以内で入力してください。" }, { status: 400 });
    }

    if (!isAllowedAspectRatio(aspectRatioRaw)) {
      return NextResponse.json({ error: "画面比率の指定が不正です。" }, { status: 400 });
    }

    const job = createVideoJob({
      fileName: file.name,
      prompt,
      aspectRatio: aspectRatioRaw
    });

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      message: "生成ジョブを受け付けました。"
    });
  } catch {
    return NextResponse.json({ error: "生成ジョブの作成に失敗しました。" }, { status: 500 });
  }
};
