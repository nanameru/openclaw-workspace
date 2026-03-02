import { NextResponse } from "next/server";
import { refreshVideoJob } from "@/lib/video-jobs";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: { jobId: string } }
) => {
  const job = await refreshVideoJob(params.jobId);
  if (!job) {
    return NextResponse.json({ error: "ジョブが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    fileName: job.fileName,
    prompt: job.prompt,
    aspectRatio: job.aspectRatio,
    status: job.status,
    outputUrl: job.outputUrl ?? null,
    errorMessage: job.errorMessage ?? null,
    createdAt: job.createdAt,
    finishedAt: job.finishedAt ?? null
  });
};
