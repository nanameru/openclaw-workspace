import { ConvexHttpClient } from "convex/browser";

type SaveBillingLogInput = {
  jobId: string;
  estimatedCredits: number;
  resolution: "720p" | "1080p" | "4k";
  seconds: 5 | 10 | 15;
  highQuality: boolean;
  aspectRatio: "9:16" | "1:1" | "16:9";
  userId?: string;
};

type BillingLog = SaveBillingLogInput & { createdAt: number };

const memoryLogs: BillingLog[] = [];

const getConvexUrl = (): string | null => {
  const direct = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (direct) return direct;

  const deployment = process.env.CONVEX_DEPLOYMENT;
  if (!deployment) return null;

  return `https://${deployment}.convex.cloud`;
};

export const saveBillingLog = async (input: SaveBillingLogInput): Promise<{ saved: boolean; reason?: string }> => {
  const log: BillingLog = { ...input, createdAt: Date.now() };
  memoryLogs.unshift(log);
  if (memoryLogs.length > 200) memoryLogs.pop();

  const convexUrl = getConvexUrl();
  if (!convexUrl) return { saved: true, reason: "memory_only" };

  try {
    const client = new ConvexHttpClient(convexUrl) as unknown as {
      mutation: (name: string, args: Record<string, unknown>) => Promise<unknown>;
    };

    await client.mutation("billing:createLog", log);
    return { saved: true };
  } catch {
    return { saved: true, reason: "convex_mutation_failed_memory_saved" };
  }
};

export const listBillingLogs = (): BillingLog[] => memoryLogs.slice(0, 50);
