import type { CivicIssue } from "./types"

// Supabase-only mode intentionally keeps notifications in the app/database.
// A mail provider can be added later without changing issue creation or status logic.
export async function notifyIssueCreated(_issue: CivicIssue) { return { delivered: false, reason: "email_provider_not_configured" as const } }
export async function notifyIssueStatusChanged(_issue: CivicIssue) { return { delivered: false, reason: "email_provider_not_configured" as const } }
