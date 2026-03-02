import { randomUUID } from "node:crypto";

export type JobStatus = "queued" | "running" | "done" | "failed";

export type VideoJob = {
  id: string;
  fileName: string;
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  status: JobStatus;
  createdAt: number;
  finishedAt?: number;
  outputUrl?: string;
  errorMessage?: string;
};

const jobs = new Map<string, VideoJob>();

const finishJobLater = (id: string): void => {
  setTimeout(() => {
    const existing = jobs.get(id);
    if (!existing) return;

    jobs.set(id, {
      ...existing,
      status: "running"
    });
  }, 1200);

  setTimeout(() => {
    const existing = jobs.get(id);
    if (!existing) return;

    jobs.set(id, {
      ...existing,
      status: "done",
      finishedAt: Date.now(),
      outputUrl: `/api/generate/${id}/download`
    });
  }, 4000);
};

export const createVideoJob = ({
  fileName,
  prompt,
  aspectRatio
}: {
  fileName: string;
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
}): VideoJob => {
  const id = randomUUID();
  const job: VideoJob = {
    id,
    fileName,
    prompt,
    aspectRatio,
    status: "queued",
    createdAt: Date.now()
  };

  jobs.set(id, job);
  finishJobLater(id);
  return job;
};

export const getVideoJob = (id: string): VideoJob | null => jobs.get(id) ?? null;
