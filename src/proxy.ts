import { NextResponse, type NextRequest } from "next/server";
import { forwardHeaders } from "@/lib/api-proxy";

/**
 * Forwards /api/v1/* to the API (API_PROXY_TARGET), so web app and API share one domain.
 * Without API_PROXY_TARGET (local development) requests go straight through and the browser
 * calls the API at NEXT_PUBLIC_API_URL instead.
 */
export function proxy(request: NextRequest) {
  const target = process.env.API_PROXY_TARGET;
  if (!target) return NextResponse.next();

  const url = new URL(request.nextUrl.pathname + request.nextUrl.search, target);
  return NextResponse.rewrite(url, { request: { headers: forwardHeaders(request.headers, process.env.PROXY_SECRET) } });
}

export const config = { matcher: "/api/v1/:path*" };
