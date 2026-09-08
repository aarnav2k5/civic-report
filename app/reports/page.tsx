"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Calendar, BarChart3, FileText, Activity } from "lucide-react"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { generateAnalytics, exportAnalyticsReport } from "@/lib/analytics"
import { loadIssues } from "@/lib/issue-store"
import { mockIssues } from "@/lib/mock-data"
import type { CivicIssue } from "@/lib/types"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("comprehensive")
  const [timeRange, setTimeRange] = useState("month")
  const [exportFormat, setExportFormat] = useState("txt")
  const [issues, setIssues] = useState<CivicIssue[]>(mockIssues)

  useEffect(() => {
    const sync = () => loadIssues().then(setIssues)
    void sync()
    window.addEventListener("civic-report:issues-updated", sync)
    return () => window.removeEventListener("civic-report:issues-updated", sync)
  }, [])

  const rangeStart = new Date()
  if (timeRange === "week") rangeStart.setDate(rangeStart.getDate() - 7)
  if (timeRange === "month") rangeStart.setMonth(rangeStart.getMonth() - 1)
  if (timeRange === "quarter") rangeStart.setMonth(rangeStart.getMonth() - 3)
  if (timeRange === "year") rangeStart.setFullYear(rangeStart.getFullYear() - 1)
  const filteredIssues = issues.filter((issue) => issue.createdAt >= rangeStart)
  const analyticsData = generateAnalytics(filteredIssues)

  const handleExportReport = () => {
    const report = exportAnalyticsReport(analyticsData, reportType)
    const csv = [
      "metric,value",
      `total_issues,${analyticsData.totalIssues}`,
      `active_issues,${analyticsData.activeIssues}`,
      `resolved_issues,${analyticsData.resolvedIssues}`,
      `average_resolution_days,${analyticsData.avgResolutionTime.toFixed(1)}`,
      ...Object.entries(analyticsData.categoryBreakdown).map(([category, count]) => `category_${category},${count}`),
    ].join("\n")
    const content = exportFormat === "csv" ? csv : report
    const blob = new Blob([content], { type: exportFormat === "csv" ? "text/csv" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `civic-analytics-report-${new Date().toISOString().split("T")[0]}.${exportFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="site-shell min-h-screen">
      {/* Header */}
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Analytics & Reports</h1>
              </div>
            </div>
            <Button onClick={handleExportReport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Report Configuration
            </CardTitle>
            <CardDescription>Customize your analytics report parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    <SelectItem value="performance">Performance Summary</SelectItem>
                    <SelectItem value="trends">Trend Analysis</SelectItem>
                    <SelectItem value="departments">Department Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">Text Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analyticsData.activeIssues}</div>
              <p className="text-xs text-muted-foreground">Active issues in this period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analyticsData.totalIssues > 0 ? `${((analyticsData.resolvedIssues / analyticsData.totalIssues) * 100).toFixed(1)}%` : "—"}</div>
              <p className="text-xs text-muted-foreground">Resolution rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analyticsData.avgResolutionTime > 0 ? `${analyticsData.avgResolutionTime.toFixed(1)}d` : "—"}</div>
              <p className="text-xs text-muted-foreground">Average time to resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <AnalyticsCharts data={analyticsData} />
      </div>
    </div>
  )
}
