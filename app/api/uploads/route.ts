import { NextResponse } from "next/server"
import { z } from "zod"
import { createImageUpload } from "@/lib/storage"

export const runtime = "nodejs"
const schema = z.object({ filename: z.string().min(1).max(120), contentType: z.string().regex(/^image\//), size: z.number().int().positive().max(10 * 1024 * 1024) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid image." }, { status: 400 })
  const upload = await createImageUpload(parsed.data.filename, parsed.data.contentType)
  if (!upload) return NextResponse.json({ configured: false })
  return NextResponse.json({ configured: true, ...upload })
}
