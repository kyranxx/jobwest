import { buildSecurityTxt } from "@/lib/public-files"

export function GET() {
  return new Response(buildSecurityTxt(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
