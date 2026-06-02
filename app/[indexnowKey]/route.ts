import { NextResponse } from "next/server"
import { getIndexNowKey, isIndexNowKeyPath } from "@/lib/marketing-integrations"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ indexnowKey: string }> },
) {
  const { indexnowKey } = await params
  const key = getIndexNowKey()

  if (!isIndexNowKeyPath(indexnowKey, key)) {
    return new NextResponse("Not found", { status: 404 })
  }

  return new NextResponse(key, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
