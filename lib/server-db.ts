import Database from "better-sqlite3"
import { mkdirSync } from "node:fs"
import path from "node:path"
import { mockIssues } from "./mock-data"
import type { CivicIssue, IssueStatus } from "./types"

type IssueRow = {
  id: string; title: string; description: string; category: CivicIssue["category"]; priority: CivicIssue["priority"]; status: IssueStatus
  latitude: number; longitude: number; address: string; image_url: string | null
  reported_by_id: string; reported_by_name: string; reported_by_email: string
  assigned_to_id: string | null; assigned_to_name: string | null; assigned_department: string | null
  created_at: string; updated_at: string; resolved_at: string | null
}

const configuredPath = process.env.CIVIC_DB_PATH || path.join("prisma", "dev.db")
const databasePath = path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath)

declare global { var civicDatabase: Database.Database | undefined }

function toIssue(row: IssueRow): CivicIssue {
  return {
    id: row.id, title: row.title, description: row.description, category: row.category, priority: row.priority, status: row.status,
    location: { lat: row.latitude, lng: row.longitude, address: row.address }, imageUrl: row.image_url || undefined,
    reportedBy: { id: row.reported_by_id, name: row.reported_by_name, email: row.reported_by_email },
    assignedTo: row.assigned_to_id ? { id: row.assigned_to_id, name: row.assigned_to_name || "Staff member", department: row.assigned_department || "Civic Services" } : undefined,
    createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at), resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
  }
}

function getDatabase() {
  if (globalThis.civicDatabase) return globalThis.civicDatabase
  mkdirSync(path.dirname(databasePath), { recursive: true })
  const database = new Database(databasePath)
  database.pragma("journal_mode = WAL")
  database.exec(`CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL, status TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, address TEXT NOT NULL, image_url TEXT, reported_by_id TEXT NOT NULL, reported_by_name TEXT NOT NULL, reported_by_email TEXT NOT NULL, assigned_to_id TEXT, assigned_to_name TEXT, assigned_department TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, resolved_at TEXT); CREATE INDEX IF NOT EXISTS issues_status_idx ON issues(status); CREATE INDEX IF NOT EXISTS issues_category_idx ON issues(category); CREATE INDEX IF NOT EXISTS issues_created_at_idx ON issues(created_at);`)
  const existing = database.prepare("SELECT COUNT(*) AS count FROM issues").get() as { count: number }
  if (existing.count === 0) {
    const insert = database.prepare("INSERT INTO issues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    database.transaction(() => mockIssues.forEach((issue) => insert.run(issue.id, issue.title, issue.description, issue.category, issue.priority, issue.status, issue.location.lat, issue.location.lng, issue.location.address, issue.imageUrl || null, issue.reportedBy.id, issue.reportedBy.name, issue.reportedBy.email, issue.assignedTo?.id || null, issue.assignedTo?.name || null, issue.assignedTo?.department || null, issue.createdAt.toISOString(), issue.updatedAt.toISOString(), issue.resolvedAt?.toISOString() || null)))()
  }
  globalThis.civicDatabase = database
  return database
}

export function listIssues() { return (getDatabase().prepare("SELECT * FROM issues ORDER BY created_at DESC").all() as IssueRow[]).map(toIssue) }

export function createIssue(issue: CivicIssue) {
  getDatabase().prepare("INSERT INTO issues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(issue.id, issue.title, issue.description, issue.category, issue.priority, issue.status, issue.location.lat, issue.location.lng, issue.location.address, issue.imageUrl || null, issue.reportedBy.id, issue.reportedBy.name, issue.reportedBy.email, issue.assignedTo?.id || null, issue.assignedTo?.name || null, issue.assignedTo?.department || null, issue.createdAt.toISOString(), issue.updatedAt.toISOString(), issue.resolvedAt?.toISOString() || null)
  return issue
}

export function updateIssue(issueId: string, updates: { status?: IssueStatus; assignedTo?: CivicIssue["assignedTo"] | null }) {
  const database = getDatabase()
  const current = database.prepare("SELECT * FROM issues WHERE id = ?").get(issueId) as IssueRow | undefined
  if (!current) return null
  const updatedAt = new Date(); const status = updates.status || current.status
  const resolvedAt = status === "resolved" ? updatedAt.toISOString() : status === "closed" ? current.resolved_at : null
  database.prepare("UPDATE issues SET status = ?, assigned_to_id = ?, assigned_to_name = ?, assigned_department = ?, updated_at = ?, resolved_at = ? WHERE id = ?").run(status, updates.assignedTo === undefined ? current.assigned_to_id : updates.assignedTo?.id || null, updates.assignedTo === undefined ? current.assigned_to_name : updates.assignedTo?.name || null, updates.assignedTo === undefined ? current.assigned_department : updates.assignedTo?.department || null, updatedAt.toISOString(), resolvedAt, issueId)
  return toIssue(database.prepare("SELECT * FROM issues WHERE id = ?").get(issueId) as IssueRow)
}
