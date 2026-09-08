import { NextResponse } from "next/server"
import { z } from "zod"
import { createIssue, listIssues } from "@/lib/server-db"
import { notifyIssueCreated } from "@/lib/email"

export const runtime = "nodejs"

const issueSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(["pothole", "streetlight", "trash", "graffiti", "sidewalk", "traffic", "water", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.literal("reported"),
  location: z.object({ lat: z.number().finite(), lng: z.number().finite(), address: z.string().trim().min(3).max(240) }),
  imageUrl: z.string().max(7_000_000).optional(),
  reportedBy: z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(120), email: z.string().email() }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export async function GET() {
  return NextResponse.json(await listIssues(), { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  try {
    const issue = issueSchema.parse(await request.json())
    const created = await createIssue({ ...issue, id: globalThis.crypto.randomUUID() })
    void notifyIssueCreated(created)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid report", details: error.flatten() }, { status: 400 })
    return NextResponse.json({ error: "Unable to create report" }, { status: 500 })
  }
}
