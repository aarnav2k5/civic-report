import { mockIssues, mockDepartments } from "./mock-data"
import type { IssueCategory, IssueStatus, IssuePriority } from "./types"

export interface AnalyticsData {
  totalIssues: number
  resolvedIssues: number
  activeIssues: number
  avgResolutionTime: number
  categoryBreakdown: Record<IssueCategory, number>
  statusBreakdown: Record<IssueStatus, number>
  priorityBreakdown: Record<IssuePriority, number>
  monthlyTrends: Array<{
    month: string
    reported: number
    resolved: number
  }>
  departmentPerformance: Array<{
    department: string
    totalIssues: number
    resolvedIssues: number
    avgResolutionTime: number
    resolutionRate: number
  }>
  responseTimeMetrics: {
    avgFirstResponse: number | null
    avgResolution: number
    slaCompliance: number | null
  }
}

export function generateAnalytics(issues = mockIssues): AnalyticsData {
  const totalIssues = issues.length
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved" || issue.status === "closed").length
  const activeIssues = issues.filter((issue) => issue.status !== "resolved" && issue.status !== "closed").length

  // Calculate average resolution time (in days)
  const resolvedWithTime = issues.filter((issue) => issue.resolvedAt)
  const avgResolutionTime =
    resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, issue) => {
          const days = Math.floor((issue.resolvedAt!.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          return acc + days
        }, 0) / resolvedWithTime.length
      : 0

  // Category breakdown
  const categoryBreakdown = {} as Record<IssueCategory, number>
  const categories: IssueCategory[] = [
    "pothole",
    "streetlight",
    "trash",
    "graffiti",
    "sidewalk",
    "traffic",
    "water",
    "other",
  ]
  categories.forEach((category) => {
    categoryBreakdown[category] = issues.filter((issue) => issue.category === category).length
  })

  // Status breakdown
  const statusBreakdown = {} as Record<IssueStatus, number>
  const statuses: IssueStatus[] = ["reported", "in-progress", "resolved", "closed"]
  statuses.forEach((status) => {
    statusBreakdown[status] = issues.filter((issue) => issue.status === status).length
  })

  // Priority breakdown
  const priorityBreakdown = {} as Record<IssuePriority, number>
  const priorities: IssuePriority[] = ["low", "medium", "high", "urgent"]
  priorities.forEach((priority) => {
    priorityBreakdown[priority] = issues.filter((issue) => issue.priority === priority).length
  })

  // Monthly trends (last 6 months)
  const monthlyTrends = []
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1))
  for (const monthDate of months) {
    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()
    monthlyTrends.push({
      month: monthDate.toLocaleDateString("en-US", { month: "short" }),
      reported: issues.filter((issue) => issue.createdAt.getMonth() === month && issue.createdAt.getFullYear() === year).length,
      resolved: issues.filter((issue) => issue.resolvedAt?.getMonth() === month && issue.resolvedAt?.getFullYear() === year).length,
    })
  }

  // Department performance
  const departmentPerformance = mockDepartments.map((dept) => {
    const deptIssues = issues.filter((issue) => dept.categories.includes(issue.category))
    const deptResolved = deptIssues.filter((issue) => issue.status === "resolved" || issue.status === "closed")
    const resolutionRate = deptIssues.length > 0 ? (deptResolved.length / deptIssues.length) * 100 : 0

    return {
      department: dept.name,
      totalIssues: deptIssues.length,
      resolvedIssues: deptResolved.length,
      avgResolutionTime: deptResolved.length > 0
        ? deptResolved.reduce((sum, issue) => sum + (issue.resolvedAt!.getTime() - issue.createdAt.getTime()) / 86400000, 0) / deptResolved.length
        : 0,
      resolutionRate,
    }
  })

  // Response and SLA timestamps are not part of the current issue schema. Do not invent them.
  const responseTimeMetrics = {
    avgFirstResponse: null,
    avgResolution: avgResolutionTime,
    slaCompliance: null,
  }

  return {
    totalIssues,
    resolvedIssues,
    activeIssues,
    avgResolutionTime,
    categoryBreakdown,
    statusBreakdown,
    priorityBreakdown,
    monthlyTrends,
    departmentPerformance,
    responseTimeMetrics,
  }
}

export function exportAnalyticsReport(data: AnalyticsData, reportType = "comprehensive"): string {
  const report = `
CIVIC ISSUE REPORTING SYSTEM - ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}
Report Type: ${reportType}

OVERVIEW
========
Total Issues: ${data.totalIssues}
Resolved Issues: ${data.resolvedIssues}
Active Issues: ${data.activeIssues}
Average Resolution Time: ${data.avgResolutionTime.toFixed(1)} days

CATEGORY BREAKDOWN
==================
${Object.entries(data.categoryBreakdown)
  .map(([category, count]) => `${category}: ${count}`)
  .join("\n")}

DEPARTMENT PERFORMANCE
======================
${data.departmentPerformance
  .map((dept) => `${dept.department}: ${dept.resolutionRate.toFixed(1)}% resolution rate`)
  .join("\n")}

RESPONSE METRICS
================
Average First Response: ${data.responseTimeMetrics.avgFirstResponse === null ? "Not tracked" : `${data.responseTimeMetrics.avgFirstResponse} hours`}
Average Resolution: ${data.responseTimeMetrics.avgResolution.toFixed(1)} days
SLA Compliance: ${data.responseTimeMetrics.slaCompliance === null ? "Not tracked" : `${data.responseTimeMetrics.slaCompliance}%`}
`
  return report
}
