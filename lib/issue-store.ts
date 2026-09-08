import { mockIssues } from "./mock-data"
import type { CivicIssue, IssueStatus } from "./types"

const STORAGE_KEY = "civic-report:issues"

function reviveIssue(issue: CivicIssue): CivicIssue {
  return {
    ...issue,
    createdAt: new Date(issue.createdAt),
    updatedAt: new Date(issue.updatedAt),
    resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
  }
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

export function saveIssues(issues: CivicIssue[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(issues))
    window.dispatchEvent(new CustomEvent("civic-report:issues-updated"))
  }
}

export function saveIssue(issue: CivicIssue) {
  saveIssues([issue, ...getIssues()])
}

export function updateIssueStatus(issueId: string, status: IssueStatus) {
  const updatedAt = new Date()
  saveIssues(
    getIssues().map((issue) =>
      issue.id === issueId
        ? { ...issue, status, updatedAt, resolvedAt: status === "resolved" ? updatedAt : issue.resolvedAt }
        : issue,
    ),
  )
}
