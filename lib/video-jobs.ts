import { randomUUID } from "node:crypto";
import { createProviderJob, getProviderJobStatus } from "@/lib/video-provider";

export type JobStatus = "queued" | "running" | "done" | "failed";

export type VideoJob = {
  id: string;
  fileName: string;
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  status: JobStatus;
  providerJobId?: string;
  createdAt: number;
  finishedAt?: number;
  outputUrl?: string;
  errorMessage?: string;
};

const jobs = new Map<string, VideoJob>();

export const createVideoJob = async ({
  fileName,
  prompt,
  aspectRatio,
  imageDataUrl
}: {
  fileName: string;
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  imageDataUrl: string;
}): Promise<VideoJob> => {
  const id = randomUUID();

  const provider = await createProviderJob({
    prompt,
    imageDataUrl,
    aspectRatio
  });

  const job: VideoJob = {
    id,
    fileName,
    prompt,
    aspectRatio,
    status: provider.providerStatus,
    providerJobId: provider.providerJobId,
    createdAt: Date.now()
  };

  jobs.set(id, job);
  return job;
};

export const refreshVideoJob = async (id: string): Promise<VideoJob | null> => {
  const job = jobs.get(id);
  if (!job) return null;
  if (!job.providerJobId) return job;
  if (job.status === "done" || job.status === "failed") return job;

  try {
    const providerStatus = await getProviderJobStatus({ providerJobId: job.providerJobId });
    const updated: VideoJob = {
      ...job,
      status: providerStatus.providerStatus,
      outputUrl: providerStatus.outputUrl ?? job.outputUrl,
      errorMessage: providerStatus.errorMessage ?? job.errorMessage,
      finishedAt: providerStatus.providerStatus === "done" || providerStatus.providerStatus === "failed"
        ? Date.now()
        : job.finishedAt
    };

    jobs.set(id, updated);
    return updated;
  } catch (error) {
    const message = error instanceof Error ? error.message : "ジョブ状態の更新に失敗しました。";
    const failed: VideoJob = {
      ...job,
      status: "failed",
      errorMessage: message,
      finishedAt: Date.now()
    };
    jobs.set(id, failed);
    return failed;
  }
};

export const getVideoJob = (id: string): VideoJob | null => jobs.get(id) ?? null;
