import Database from "better-sqlite3"
import { mkdirSync } from "node:fs"
import path from "node:path"
import { Pool } from "pg"
import { mockIssues } from "./mock-data"
import type { CivicIssue, IssueStatus, User } from "./types"

type IssueRow = {
  id: string; title: string; description: string; category: CivicIssue["category"]; priority: CivicIssue["priority"]; status: IssueStatus
  latitude: number; longitude: number; address: string; image_url: string | null
  reported_by_id: string; reported_by_name: string; reported_by_email: string
  assigned_to_id: string | null; assigned_to_name: string | null; assigned_department: string | null
  created_at: string; updated_at: string; resolved_at: string | null
}
type UserRow = { id: string; name: string; email: string; role: User["role"]; department: string | null; password_hash: string }

const configuredPath = process.env.CIVIC_DB_PATH || path.join("prisma", "dev.db")
const databasePath = path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath)
const databaseUrl = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "")
const usePostgres = Boolean(databaseUrl && /^postgres(ql)?:\/\//i.test(databaseUrl))

declare global { var civicDatabase: Database.Database | undefined; var civicPool: Pool | undefined }

function toIssue(row: IssueRow): CivicIssue {
  return {
    id: row.id, title: row.title, description: row.description, category: row.category, priority: row.priority, status: row.status,
    location: { lat: Number(row.latitude), lng: Number(row.longitude), address: row.address }, imageUrl: row.image_url || undefined,
    reportedBy: { id: row.reported_by_id, name: row.reported_by_name, email: row.reported_by_email },
    assignedTo: row.assigned_to_id ? { id: row.assigned_to_id, name: row.assigned_to_name || "Staff member", department: row.assigned_department || "Civic Services" } : undefined,
    createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at), resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
  }
}

function toUser(row: UserRow): User & { passwordHash: string } {
  return { id: row.id, name: row.name, email: row.email, role: row.role, department: row.department || undefined, passwordHash: row.password_hash }
}

function getSqlite() {
  if (globalThis.civicDatabase) return globalThis.civicDatabase
  mkdirSync(path.dirname(databasePath), { recursive: true })
  const database = new Database(databasePath)
  database.pragma("journal_mode = WAL")
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role TEXT NOT NULL, department TEXT, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL, status TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, address TEXT NOT NULL, image_url TEXT, reported_by_id TEXT NOT NULL, reported_by_name TEXT NOT NULL, reported_by_email TEXT NOT NULL, assigned_to_id TEXT, assigned_to_name TEXT, assigned_department TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, resolved_at TEXT);
    CREATE INDEX IF NOT EXISTS issues_status_idx ON issues(status); CREATE INDEX IF NOT EXISTS issues_category_idx ON issues(category); CREATE INDEX IF NOT EXISTS issues_created_at_idx ON issues(created_at);
  `)
  const existing = database.prepare("SELECT COUNT(*) AS count FROM issues").get() as { count: number }
  if (existing.count === 0) {
    const insert = database.prepare("INSERT INTO issues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    database.transaction(() => mockIssues.forEach((issue) => insert.run(issue.id, issue.title, issue.description, issue.category, issue.priority, issue.status, issue.location.lat, issue.location.lng, issue.location.address, issue.imageUrl || null, issue.reportedBy.id, issue.reportedBy.name, issue.reportedBy.email, issue.assignedTo?.id || null, issue.assignedTo?.name || null, issue.assignedTo?.department || null, issue.createdAt.toISOString(), issue.updatedAt.toISOString(), issue.resolvedAt?.toISOString() || null)))()
  }
  globalThis.civicDatabase = database
  return database
}

function getPostgres() {
  if (globalThis.civicPool) return globalThis.civicPool
  globalThis.civicPool = new Pool({ connectionString: databaseUrl, max: 10, idleTimeoutMillis: 30_000 })
  return globalThis.civicPool
}

async function ensurePostgres() {
  const pool = getPostgres()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role TEXT NOT NULL CHECK (role IN ('citizen','staff','admin')), department TEXT, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL);
    CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL, status TEXT NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, address TEXT NOT NULL, image_url TEXT, reported_by_id TEXT NOT NULL, reported_by_name TEXT NOT NULL, reported_by_email TEXT NOT NULL, assigned_to_id TEXT, assigned_to_name TEXT, assigned_department TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL, resolved_at TIMESTAMPTZ);
    CREATE INDEX IF NOT EXISTS issues_status_idx ON issues(status); CREATE INDEX IF NOT EXISTS issues_category_idx ON issues(category); CREATE INDEX IF NOT EXISTS issues_created_at_idx ON issues(created_at);
  `)
  const { rows } = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM issues")
  if (Number(rows[0]?.count) === 0) {
    for (const issue of mockIssues) await pool.query("INSERT INTO issues VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT DO NOTHING", [issue.id, issue.title, issue.description, issue.category, issue.priority, issue.status, issue.location.lat, issue.location.lng, issue.location.address, issue.imageUrl || null, issue.reportedBy.id, issue.reportedBy.name, issue.reportedBy.email, issue.assignedTo?.id || null, issue.assignedTo?.name || null, issue.assignedTo?.department || null, issue.createdAt, issue.updatedAt, issue.resolvedAt || null])
  }
}

export async function listIssues() {
  if (usePostgres) { await ensurePostgres(); const { rows } = await getPostgres().query<IssueRow>("SELECT * FROM issues ORDER BY created_at DESC"); return rows.map(toIssue) }
  return (getSqlite().prepare("SELECT * FROM issues ORDER BY created_at DESC").all() as IssueRow[]).map(toIssue)
}

export async function createIssue(issue: CivicIssue) {
  if (usePostgres) { await ensurePostgres(); await getPostgres().query("INSERT INTO issues VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)", [issue.id, issue.title, issue.description, issue.category, issue.priority, issue.status, issue.location.lat, issue.location.lng, issue.location.address, issue.imageUrl || null, issue.reportedBy.id, issue.reportedBy.name, issue.reportedBy.email, issue.assignedTo?.id || null, issue.assignedTo?.name || null, issue.assignedTo?.department || null, issue.createdAt, issue.updatedAt, issue.resolvedAt || null]); return issue }
  getSqlite().prepare("INSERT INTO issues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(issue.id, issue.title, issue.description, issue.category, issue.priority, issue.status, issue.location.lat, issue.location.lng, issue.location.address, issue.imageUrl || null, issue.reportedBy.id, issue.reportedBy.name, issue.reportedBy.email, issue.assignedTo?.id || null, issue.assignedTo?.name || null, issue.assignedTo?.department || null, issue.createdAt.toISOString(), issue.updatedAt.toISOString(), issue.resolvedAt?.toISOString() || null); return issue
}

export async function updateIssue(issueId: string, updates: { status?: IssueStatus; assignedTo?: CivicIssue["assignedTo"] | null }) {
  if (usePostgres) { await ensurePostgres(); const current = await getPostgres().query<IssueRow>("SELECT * FROM issues WHERE id = $1", [issueId]); if (!current.rows[0]) return null; const row = current.rows[0]; const updatedAt = new Date(); const status = updates.status || row.status; const resolvedAt = status === "resolved" ? updatedAt : status === "closed" ? row.resolved_at : null; const result = await getPostgres().query<IssueRow>("UPDATE issues SET status=$1, assigned_to_id=$2, assigned_to_name=$3, assigned_department=$4, updated_at=$5, resolved_at=$6 WHERE id=$7 RETURNING *", [status, updates.assignedTo === undefined ? row.assigned_to_id : updates.assignedTo?.id || null, updates.assignedTo === undefined ? row.assigned_to_name : updates.assignedTo?.name || null, updates.assignedTo === undefined ? row.assigned_department : updates.assignedTo?.department || null, updatedAt, resolvedAt, issueId]); return result.rows[0] ? toIssue(result.rows[0]) : null }
  const database = getSqlite(); const current = database.prepare("SELECT * FROM issues WHERE id = ?").get(issueId) as IssueRow | undefined; if (!current) return null; const updatedAt = new Date(); const status = updates.status || current.status; const resolvedAt = status === "resolved" ? updatedAt.toISOString() : status === "closed" ? current.resolved_at : null; database.prepare("UPDATE issues SET status = ?, assigned_to_id = ?, assigned_to_name = ?, assigned_department = ?, updated_at = ?, resolved_at = ? WHERE id = ?").run(status, updates.assignedTo === undefined ? current.assigned_to_id : updates.assignedTo?.id || null, updates.assignedTo === undefined ? current.assigned_to_name : updates.assignedTo?.name || null, updates.assignedTo === undefined ? current.assigned_department : updates.assignedTo?.department || null, updatedAt.toISOString(), resolvedAt, issueId); return toIssue(database.prepare("SELECT * FROM issues WHERE id = ?").get(issueId) as IssueRow)
}

export async function findUserByEmail(email: string) {
  if (usePostgres) { await ensurePostgres(); const { rows } = await getPostgres().query<UserRow>("SELECT * FROM users WHERE LOWER(email)=LOWER($1)", [email]); return rows[0] ? toUser(rows[0]) : null }
  const row = getSqlite().prepare("SELECT * FROM users WHERE LOWER(email)=LOWER(?)").get(email) as UserRow | undefined; return row ? toUser(row) : null
}

export async function createUser(user: { id: string; name: string; email: string; role: User["role"]; department?: string; passwordHash: string }) {
  if (usePostgres) { await ensurePostgres(); await getPostgres().query("INSERT INTO users (id,name,email,role,department,password_hash,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (email) DO NOTHING", [user.id, user.name, user.email, user.role, user.department || null, user.passwordHash, new Date()]); return }
  getSqlite().prepare("INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?, ?, ?, ?)").run(user.id, user.name, user.email, user.role, user.department || null, user.passwordHash, new Date().toISOString())
}

export async function listUsers(role?: User["role"]) {
  if (usePostgres) { await ensurePostgres(); const { rows } = await getPostgres().query<UserRow>(role ? "SELECT * FROM users WHERE role=$1 ORDER BY name" : "SELECT * FROM users ORDER BY name", role ? [role] : []); return rows.map(toUser).map(({ passwordHash: _passwordHash, ...user }) => user) }
  const rows = getSqlite().prepare(role ? "SELECT * FROM users WHERE role=? ORDER BY name" : "SELECT * FROM users ORDER BY name").all(...(role ? [role] : [])) as UserRow[]; return rows.map(toUser).map(({ passwordHash: _passwordHash, ...user }) => user)
}

export async function getSessionUser(tokenHash: string) {
  if (usePostgres) { await ensurePostgres(); const { rows } = await getPostgres().query<UserRow>("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > NOW()", [tokenHash]); return rows[0] ? toUser(rows[0]) : null }
  const row = getSqlite().prepare("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > ?").get(tokenHash, new Date().toISOString()) as UserRow | undefined; return row ? toUser(row) : null
}

export async function createSession(tokenHash: string, userId: string, expiresAt: Date) {
  if (usePostgres) { await ensurePostgres(); await getPostgres().query("INSERT INTO sessions VALUES ($1,$2,$3)", [tokenHash, userId, expiresAt]); return }
  getSqlite().prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(tokenHash, userId, expiresAt.toISOString())
}

export async function deleteSession(tokenHash: string) {
  if (usePostgres) { await ensurePostgres(); await getPostgres().query("DELETE FROM sessions WHERE token_hash=$1", [tokenHash]); return }
  getSqlite().prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash)
}

export async function ensureDevelopmentAdmin(passwordHash: string) {
  await createUser({ id: "local-admin", name: "CivicReport Admin", email: process.env.CIVIC_ADMIN_EMAIL || "admin@civicreport.local", role: "admin", department: "Civic Operations", passwordHash })
}
