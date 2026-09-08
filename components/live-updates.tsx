"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, MapPin, Clock, Users, TrendingUp, Pause, Play } from "lucide-react"
import { loadIssues } from "@/lib/issue-store"
import { statusColors, statusLabels, getTimeAgo } from "@/lib/utils/issue-utils"
import type { CivicIssue } from "@/lib/types"

interface LiveUpdate {
  id: string
  type: "new_report" | "status_change" | "assignment" | "resolution"
  issue: CivicIssue
  message: string
  timestamp: Date
}

export function LiveUpdates() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const [isLive, setIsLive] = useState(true)
  const [stats, setStats] = useState({ openIssues: 0, reportsToday: 0, resolvedIssues: 0 })

  useEffect(() => {
    if (!isLive) return

    let previousSignature = ""
    const sync = async () => {
      const issues = await loadIssues()
      const signature = issues.map((issue) => `${issue.id}:${issue.status}:${issue.updatedAt.toISOString()}`).join("|")
      setStats({
        openIssues: issues.filter((issue) => issue.status !== "resolved" && issue.status !== "closed").length,
        reportsToday: issues.filter((issue) => issue.createdAt.toDateString() === new Date().toDateString()).length,
        resolvedIssues: issues.filter((issue) => issue.status === "resolved" || issue.status === "closed").length,
      })
      if (signature !== previousSignature && issues[0]) {
        const issue = issues[0]
        const updateType: LiveUpdate["type"] = issue.status === "resolved" ? "resolution" : "status_change"
        setUpdates((prev) => [{ id: `${issue.id}-${issue.updatedAt.toISOString()}`, type: updateType, issue, message: `Issue is ${statusLabels[issue.status].toLowerCase()}`, timestamp: issue.updatedAt }, ...prev.filter((update) => update.issue.id !== issue.id)].slice(0, 10))
        previousSignature = signature
      }
    }
    void sync()
    const interval = setInterval(() => void sync(), 8000)

    return () => clearInterval(interval)
  }, [isLive])

  const getUpdateIcon = (type: LiveUpdate["type"]) => {
    switch (type) {
      case "new_report":
        return "🆕"
      case "status_change":
        return "🔄"
      case "assignment":
        return "👤"
      case "resolution":
        return "✅"
      default:
        return "📋"
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Open Issues</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {stats.openIssues}
            </div>
            <p className="text-xs text-gray-500">Reports needing attention</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Reports Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {stats.reportsToday}
            </div>
            <p className="text-xs text-gray-500">New issues reported</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Resolved Issues</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              {stats.resolvedIssues}
            </div>
            <p className="text-xs text-gray-500">Completed by city teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <CardTitle className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
                Live Activity Feed
              </CardTitle>
              {isLive && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="border-blue-200 hover:bg-blue-50 text-blue-600"
            >
              {isLive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
          <CardDescription className="text-gray-600">Real-time updates from across the city</CardDescription>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Waiting for live updates...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-start space-x-3 p-3 border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors bg-white/50"
                >
                  <div className="text-lg">{getUpdateIcon(update.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={statusColors[update.issue.status]} variant="secondary">
                        {statusLabels[update.issue.status]}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700">{update.message}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">{update.issue.title}</h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                      {update.issue.location.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{getTimeAgo(update.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
