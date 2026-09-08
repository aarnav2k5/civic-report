import { Resend } from "resend"
import type { CivicIssue } from "./types"

export async function notifyIssueCreated(issue: CivicIssue) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return { delivered: false, reason: "email_not_configured" as const }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to: issue.reportedBy.email, subject: `CivicReport received: ${issue.title}`, text: `Your report has been received. Reference ${issue.id}. We will email you when its status changes.` })
  return { delivered: !result.error }
}

export async function notifyIssueStatusChanged(issue: CivicIssue) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return { delivered: false, reason: "email_not_configured" as const }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to: issue.reportedBy.email, subject: `CivicReport update: ${issue.title}`, text: `Your report ${issue.id} is now ${issue.status}.` })
  return { delivered: !result.error }
}
