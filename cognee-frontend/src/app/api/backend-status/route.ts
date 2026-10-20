import { collectRuntimeConfig, getServerBackendUrl } from "@/modules/config/serverRuntimeConfig";

export const dynamic = "force-dynamic";

type BackendStatus =
  | { status: "not_configured"; message: string }
  | { status: "misconfigured"; message: string }
  | { status: "unreachable"; backendUrl: string; message: string }
  | { status: "unhealthy"; backendUrl: string; httpStatus: number }
  | { status: "ok"; backendUrl: string };

/**
 * Operator-facing probe: configured backend URL and live /health result.
 * Does not expose secrets.
 */
export async function GET(): Promise<Response> {
  const published = collectRuntimeConfig();
  if (published.requireBackendUrl && !published.backendUrl) {
    return Response.json({
      status: "not_configured",
      message: "COGNEE_BACKEND_URL is required but not set.",
    } satisfies BackendStatus);
  }

  let backendUrl: string;
  try {
    backendUrl = getServerBackendUrl();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid COGNEE_BACKEND_URL.";
    return Response.json({ status: "misconfigured", message } satisfies BackendStatus);
  }

  if (published.requireBackendUrl && !published.backendUrl) {
    return Response.json({
      status: "not_configured",
      message: "COGNEE_BACKEND_URL is required but not set.",
    } satisfies BackendStatus);
  }

  try {
    const health = await fetch(`${backendUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!health.ok) {
      return Response.json({
        status: "unhealthy",
        backendUrl,
        httpStatus: health.status,
      } satisfies BackendStatus);
    }
    return Response.json({ status: "ok", backendUrl } satisfies BackendStatus);
  } catch {
    return Response.json({
      status: "unreachable",
      backendUrl,
      message: "Could not reach backend /health.",
    } satisfies BackendStatus);
  }
}
