import { NextResponse } from "next/server";
import { listBillingLogs } from "@/lib/billing-store";

export const runtime = "nodejs";

export const GET = async () => {
  return NextResponse.json({ logs: listBillingLogs() });
};
