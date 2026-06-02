import { buildLlmsTxt } from "@/lib/public-files"

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
