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
    avgFirstResponse: number
    avgResolution: number
    slaCompliance: number
  }
}

export function generateAnalytics(): AnalyticsData {
  const totalIssues = mockIssues.length
  const resolvedIssues = mockIssues.filter((issue) => issue.status === "resolved").length
  const activeIssues = mockIssues.filter((issue) => issue.status !== "resolved" && issue.status !== "closed").length

  // Calculate average resolution time (in days)
  const resolvedWithTime = mockIssues.filter((issue) => issue.resolvedAt)
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
    categoryBreakdown[category] = mockIssues.filter((issue) => issue.category === category).length
  })

  // Status breakdown
  const statusBreakdown = {} as Record<IssueStatus, number>
  const statuses: IssueStatus[] = ["reported", "in-progress", "resolved", "closed"]
  statuses.forEach((status) => {
    statusBreakdown[status] = mockIssues.filter((issue) => issue.status === status).length
  })

  // Priority breakdown
  const priorityBreakdown = {} as Record<IssuePriority, number>
  const priorities: IssuePriority[] = ["low", "medium", "high", "urgent"]
  priorities.forEach((priority) => {
    priorityBreakdown[priority] = mockIssues.filter((issue) => issue.priority === priority).length
  })

  // Monthly trends (last 6 months)
  const monthlyTrends = []
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  for (let i = 0; i < 6; i++) {
    monthlyTrends.push({
      month: months[i],
      reported: Math.floor(Math.random() * 20) + 10,
      resolved: Math.floor(Math.random() * 15) + 8,
    })
  }

  // Department performance
  const departmentPerformance = mockDepartments.map((dept) => {
    const deptIssues = mockIssues.filter((issue) => dept.categories.includes(issue.category))
    const deptResolved = deptIssues.filter((issue) => issue.status === "resolved")
    const resolutionRate = deptIssues.length > 0 ? (deptResolved.length / deptIssues.length) * 100 : 0

    return {
      department: dept.name,
      totalIssues: deptIssues.length,
      resolvedIssues: deptResolved.length,
      avgResolutionTime: Math.random() * 3 + 1, // 1-4 days
      resolutionRate,
    }
  })

  // Response time metrics
  const responseTimeMetrics = {
    avgFirstResponse: 2.4, // hours
    avgResolution: avgResolutionTime,
    slaCompliance: 87.5, // percentage
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

export function exportAnalyticsReport(data: AnalyticsData): string {
  const report = `
CIVIC ISSUE REPORTING SYSTEM - ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}

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
Average First Response: ${data.responseTimeMetrics.avgFirstResponse} hours
Average Resolution: ${data.responseTimeMetrics.avgResolution.toFixed(1)} days
SLA Compliance: ${data.responseTimeMetrics.slaCompliance}%
`
  return report
}
