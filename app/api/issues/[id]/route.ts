import { NextResponse } from "next/server"
import { z } from "zod"
import { updateIssue } from "@/lib/server-db"
import { requireRole } from "@/lib/auth"
import { notifyIssueStatusChanged } from "@/lib/email"

export const runtime = "nodejs"

const updateSchema = z.object({
  status: z.enum(["reported", "in-progress", "resolved", "closed"]).optional(),
  assignedTo: z.object({ id: z.string(), name: z.string(), department: z.string() }).nullable().optional(),
}).refine((value) => value.status !== undefined || value.assignedTo !== undefined, "At least one update is required")

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireRole(["admin", "staff"])
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
  try {
    const updates = updateSchema.parse(await request.json())
    const issue = await updateIssue(params.id, updates)
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    if (updates.status) void notifyIssueStatusChanged(issue)
    return NextResponse.json(issue)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid update", details: error.flatten() }, { status: 400 })
    return NextResponse.json({ error: "Unable to update report" }, { status: 500 })
  }
}
