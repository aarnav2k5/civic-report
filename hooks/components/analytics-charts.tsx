"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react"
import { categoryLabels } from "@/lib/utils/issue-utils"
import type { AnalyticsData } from "@/lib/analytics"

interface AnalyticsChartsProps {
  data: AnalyticsData
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const resolutionRate = data.totalIssues > 0 ? (data.resolvedIssues / data.totalIssues) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {resolutionRate.toFixed(1)}%
            </div>
            <Progress value={resolutionRate} className="mt-2" />
            <p className="text-xs text-gray-500 mt-2">
              {data.resolvedIssues} of {data.totalIssues} issues resolved
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {data.avgResolutionTime.toFixed(1)} days
            </div>
            <p className="text-xs text-gray-500">Target: 3.0 days</p>
            <div className="mt-2">
              {data.avgResolutionTime <= 3 ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">On Target</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200">Above Target</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">First Response</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              {data.responseTimeMetrics.avgFirstResponse}h
            </div>
            <p className="text-xs text-gray-500">Average response time</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">SLA Compliance</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
              {data.responseTimeMetrics.slaCompliance}%
            </div>
            <Progress value={data.responseTimeMetrics.slaCompliance} className="mt-2" />
            <p className="text-xs text-gray-500 mt-2">Service level agreement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
              Issues by Category
            </CardTitle>
            <CardDescription className="text-gray-600">
              Distribution of reported issues across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => {
                  const percentage = data.totalIssues > 0 ? (count / data.totalIssues) * 100 : 0
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{count}</span>
                          <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
              Monthly Trends
            </CardTitle>
            <CardDescription className="text-gray-600">Issues reported vs resolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthlyTrends.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-blue-600">Reported: {month.reported}</span>
                      <span className="text-green-600">Resolved: {month.resolved}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(month.reported / 30) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-green-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                        style={{ width: `${(month.resolved / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
            Department Performance
          </CardTitle>
          <CardDescription className="text-gray-600">Resolution rates and response times by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.departmentPerformance.map((dept) => (
              <div key={dept.department} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{dept.department}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Total: {dept.totalIssues}</span>
                    <span>Resolved: {dept.resolvedIssues}</span>
                    <span>Avg Time: {dept.avgResolutionTime.toFixed(1)}d</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Resolution Rate</span>
                    <span className="font-medium text-gray-800">{dept.resolutionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={dept.resolutionRate} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      {dept.totalIssues}
                    </div>
                    <div className="text-xs text-gray-600">Total Issues</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                      {dept.resolvedIssues}
                    </div>
                    <div className="text-xs text-gray-600">Resolved</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                      {dept.avgResolutionTime.toFixed(1)}d
                    </div>
                    <div className="text-xs text-gray-600">Avg Time</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
              Status Distribution
            </CardTitle>
            <CardDescription className="text-gray-600">Current status of all issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.statusBreakdown).map(([status, count]) => {
                const percentage = data.totalIssues > 0 ? (count / data.totalIssues) * 100 : 0
                const colors = {
                  reported: "bg-gray-500",
                  "in-progress": "bg-blue-500",
                  resolved: "bg-green-500",
                  closed: "bg-purple-500",
                }

                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`}></div>
                      <span className="text-sm font-medium capitalize text-gray-700">{status.replace("-", " ")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
              Priority Distribution
            </CardTitle>
            <CardDescription className="text-gray-600">Issues by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.priorityBreakdown).map(([priority, count]) => {
                const percentage = data.totalIssues > 0 ? (count / data.totalIssues) * 100 : 0
                const colors = {
                  low: "bg-blue-500",
                  medium: "bg-green-500",
                  high: "bg-purple-500",
                  urgent: "bg-red-500",
                }

                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[priority as keyof typeof colors]}`}></div>
                      <span className="text-sm font-medium capitalize text-gray-700">{priority}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
