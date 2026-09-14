/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  ANALYTICS: AnalyticsEngineDataset;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/__analytics/event") {
      if (request.method !== "POST") {
        return new Response(null, { status: 405 });
      }

      const payload = (await request.json().catch(() => null)) as {
        event?: unknown;
      } | null;
      const event = typeof payload?.event === "string" ? payload.event : "";
      const allowedEvents = new Set([
        "whatsapp_click",
        "email_click",
        "orientation_click",
        "solutions_click",
        "pdf_click",
        "science_tab_click",
        "knowledge_filter_click",
        "learning_game_start",
      ]);

      if (!allowedEvents.has(event)) {
        return new Response(null, { status: 204 });
      }

      env.ANALYTICS.writeDataPoint({
        blobs: [event, url.hostname],
        doubles: [1],
        indexes: [event],
      });
      return new Response(null, { status: 204 });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;