import type { IssueCategory, IssuePriority, IssueStatus } from "../types"

export const categoryLabels: Record<IssueCategory, string> = {
  pothole: "Pothole",
  streetlight: "Street Light",
  trash: "Trash/Sanitation",
  graffiti: "Graffiti",
  sidewalk: "Sidewalk",
  traffic: "Traffic Signal",
  water: "Water/Utilities",
  other: "Other",
}

export const priorityLabels: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

export const statusLabels: Record<IssueStatus, string> = {
  reported: "Reported",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
}

export const priorityColors: Record<IssuePriority, string> = {
  low: "border border-cyan-400/30 bg-cyan-400/15 text-cyan-100",
  medium: "border border-amber-400/30 bg-amber-400/15 text-amber-100",
  high: "border border-orange-400/30 bg-orange-400/15 text-orange-100",
  urgent: "border border-red-400/30 bg-red-400/15 text-red-100",
}

export const statusColors: Record<IssueStatus, string> = {
  reported: "border border-slate-400/30 bg-slate-500/25 text-slate-100",
  "in-progress": "border border-blue-400/30 bg-blue-400/20 text-blue-100",
  resolved: "border border-emerald-400/30 bg-emerald-400/20 text-emerald-100",
  closed: "border border-slate-400/30 bg-slate-500/25 text-slate-100",
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}
