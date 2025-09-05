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
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export const statusColors: Record<IssueStatus, string> = {
  reported: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-800",
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
