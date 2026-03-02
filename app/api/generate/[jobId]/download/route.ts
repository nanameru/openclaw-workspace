import { NextResponse } from "next/server";
import { getVideoJob } from "@/lib/video-jobs";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: { jobId: string } }
) => {
  const job = getVideoJob(params.jobId);
  if (!job || job.status !== "done") {
    return NextResponse.json({ error: "動画はまだ生成されていません。" }, { status: 404 });
  }

  return NextResponse.json({
    message: "MVP版のためダミー出力です。実運用では署名付きURLを返します。",
    jobId: job.id,
    fileName: `${job.id}.mp4`
  });
};
