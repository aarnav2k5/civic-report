import { mockIssues } from "./mock-data"
import type { CivicIssue, IssueStatus } from "./types"

const STORAGE_KEY = "civic-report:issues"
const UPDATED_EVENT = "civic-report:issues-updated"

function reviveIssue(issue: CivicIssue): CivicIssue {
  return { ...issue, createdAt: new Date(issue.createdAt), updatedAt: new Date(issue.updatedAt), resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined }
}

function notifyUpdated() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(UPDATED_EVENT))
}

export function getIssues(): CivicIssue[] {
  if (typeof window === "undefined") return mockIssues
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored).map(reviveIssue) : mockIssues
  } catch {
    return mockIssues
  }
}

export async function loadIssues(): Promise<CivicIssue[]> {
  try {
    const response = await fetch("/api/issues", { cache: "no-store" })
    if (!response.ok) throw new Error("Unable to load issues")
    return ((await response.json()) as CivicIssue[]).map(reviveIssue)
  } catch {
    return getIssues()
  }
}

export async function createIssue(issue: CivicIssue): Promise<CivicIssue> {
  const response = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(issue) })
  if (!response.ok) throw new Error("Unable to save issue")
  const created = reviveIssue((await response.json()) as CivicIssue)
  notifyUpdated()
  return created
}

export async function updateIssue(issueId: string, updates: Partial<Pick<CivicIssue, "status" | "assignedTo">>): Promise<CivicIssue> {
  const response = await fetch(`/api/issues/${encodeURIComponent(issueId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) })
  if (!response.ok) throw new Error("Unable to update issue")
  const updated = reviveIssue((await response.json()) as CivicIssue)
  notifyUpdated()
  return updated
}

// Local fallback helpers keep the UI resilient when the API is unavailable offline.
export function saveIssues(issues: CivicIssue[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(issues))
    notifyUpdated()
  }
}

export function saveIssue(issue: CivicIssue) { saveIssues([issue, ...getIssues()]) }

export function updateIssueStatus(issueId: string, status: IssueStatus) {
  const updatedAt = new Date()
  saveIssues(getIssues().map((issue) => issue.id === issueId ? { ...issue, status, updatedAt, resolvedAt: status === "resolved" ? updatedAt : issue.resolvedAt } : issue))
}
