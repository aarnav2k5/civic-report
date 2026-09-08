import { NextResponse } from "next/server"
import { z } from "zod"
import { uploadImage } from "@/lib/storage"

export const runtime = "nodejs"
const schema = z.object({ filename: z.string().min(1).max(120), contentType: z.string().regex(/^image\//), size: z.number().int().positive().max(10 * 1024 * 1024) })

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof Blob)) return NextResponse.json({ error: "Image file is required." }, { status: 400 })
  const parsed = schema.safeParse({ filename: file instanceof File ? file.name : "issue-image", contentType: file.type, size: file.size })
  if (!parsed.success) return NextResponse.json({ error: "Invalid image." }, { status: 400 })
  const imageUrl = await uploadImage(file, parsed.data.filename, parsed.data.contentType)
  if (!imageUrl) return NextResponse.json({ configured: false, error: "Supabase Storage is not configured." }, { status: 503 })
  return NextResponse.json({ configured: true, imageUrl })
}
