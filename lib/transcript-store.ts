import { ConvexHttpClient } from "convex/browser";
import type { TranscriptResult } from "@/lib/types";

type SaveTranscriptInput = {
  result: TranscriptResult;
  userId?: string;
};

const getConvexUrl = (): string | null => {
  const direct = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (direct) return direct;

  const deployment = process.env.CONVEX_DEPLOYMENT;
  if (!deployment) return null;

  return `https://${deployment}.convex.cloud`;
};

export const saveTranscriptIfConfigured = async ({
  result,
  userId
}: SaveTranscriptInput): Promise<{ saved: boolean; reason?: string }> => {
  const convexUrl = getConvexUrl();
  if (!convexUrl) {
    return { saved: false, reason: "convex_not_configured" };
  }

  try {
    const client = new ConvexHttpClient(convexUrl) as unknown as {
      mutation: (name: string, args: Record<string, unknown>) => Promise<unknown>;
    };
    await client.mutation("transcripts:createTranscript", {
      userId,
      sourceUrl: result.sourceUrl,
      provider: result.provider,
      text: result.text
    });

    return { saved: true };
  } catch {
    return { saved: false, reason: "convex_mutation_failed" };
  }
};
