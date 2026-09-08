import { createHash, randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { createSession, deleteSession, ensureDevelopmentAdmin, findUserByEmail, getSessionUser } from "./server-db"
import type { User } from "./types"
import bcrypt from "bcryptjs"

export const SESSION_COOKIE = "civic_session"
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 7

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex") }

export async function ensureLocalAdmin() {
  const password = process.env.CIVIC_ADMIN_PASSWORD
  if (password) await ensureDevelopmentAdmin(await bcrypt.hash(password, 12))
}

export async function authenticate(email: string, password: string) {
  await ensureLocalAdmin()
  const user = await findUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null
  const token = randomBytes(32).toString("base64url")
  await createSession(hashToken(token), user.id, new Date(Date.now() + sessionLifetimeMs))
  return { token, user: publicUser(user) }
}

export async function currentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getSessionUser(hashToken(token))
  return user ? publicUser(user) : null
}

export async function signOut() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (token) await deleteSession(hashToken(token))
}

export function publicUser(user: User) { return { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } }

export async function requireRole(roles: User["role"][]) {
  const user = await currentUser()
  if (!user || !roles.includes(user.role)) return null
  return user
}
