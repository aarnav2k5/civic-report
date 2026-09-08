"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Camera, Navigation } from "lucide-react"
import { mockIssues } from "@/lib/mock-data"
import { categoryLabels, statusColors, priorityColors, getTimeAgo } from "@/lib/utils/issue-utils"
import { loadIssues } from "@/lib/issue-store"
import type { CivicIssue } from "@/lib/types"

export default function MapPage() {
  const [issues, setIssues] = useState<CivicIssue[]>(mockIssues)
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue>(mockIssues[0])

  useEffect(() => {
    const sync = async () => {
      const next = await loadIssues()
      setIssues(next)
      setSelectedIssue((current) => next.find((issue) => issue.id === current?.id) ?? next[0])
    }
    void sync()
    window.addEventListener("civic-report:issues-updated", sync)
    return () => window.removeEventListener("civic-report:issues-updated", sync)
  }, [])

  return (
    <div className="site-shell min-h-screen">
      {/* Header */}
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Issue Map</h1>
              </div>
            </div>
            <Link href="/report">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Camera className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Map Interface */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Map Area */}
        <div className="flex-1 relative bg-gray-100">
          <div className="relative w-full h-full overflow-hidden bg-[#dbeafe] bg-[linear-gradient(32deg,transparent_48%,rgba(59,130,246,.18)_49%,rgba(59,130,246,.18)_51%,transparent_52%),linear-gradient(118deg,transparent_48%,rgba(59,130,246,.14)_49%,rgba(59,130,246,.14)_51%,transparent_52%)]">
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,#fff_0,transparent_30%),radial-gradient(circle_at_80%_70%,#bfdbfe_0,transparent_35%)]" />
            <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Navigation className="mr-2 inline h-4 w-4 text-blue-600" /> Community issue map
            </div>
            {issues.map((issue, index) => {
              const left = 16 + ((issue.location.lng + 74.01) / 0.04) * 68
              const top = 18 + ((40.77 - issue.location.lat) / 0.07) * 64
              return (
                <button
                  key={issue.id}
                  type="button"
                  aria-label={`Show ${issue.title}`}
                  onClick={() => setSelectedIssue(issue)}
                  className={`absolute z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition-transform hover:scale-125 ${issue.status === "resolved" ? "bg-emerald-500" : issue.priority === "high" || issue.priority === "urgent" ? "bg-red-500" : "bg-blue-600"}`}
                  style={{ left: `${Math.min(90, Math.max(8, left + index * 2))}%`, top: `${Math.min(88, Math.max(12, top + index * 3))}%` }}
                >
                  <span className="sr-only">{issue.title}</span>
                </button>
              )
            })}
            <div className="absolute bottom-6 left-6 rounded-xl bg-white/90 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
              Select a marker or issue to inspect the report
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button size="sm" variant="secondary" className="bg-white shadow-md">
              <MapPin className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <Card className="absolute bottom-4 left-4 w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs">High Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs">Medium Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Low Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs">Resolved</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Issues Near You</h2>
            <p className="text-sm text-gray-600 mt-1">{issues.length} issues found</p>
          </div>

          <div className="divide-y">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedIssue?.id === issue.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start space-x-3">
                  {issue.imageUrl && (
                    <Image
                      src={issue.imageUrl || "/placeholder.svg"}
                      alt={issue.title}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={statusColors[issue.status]} variant="secondary">
                        {issue.status}
                      </Badge>
                      <Badge className={priorityColors[issue.priority]} variant="secondary">
                        {issue.priority}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      {issue.location.address}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryLabels[issue.category]} • {getTimeAgo(issue.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Issue Details (Mobile) */}
      {selectedIssue && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={statusColors[selectedIssue.status]} variant="secondary">
                {selectedIssue.status}
              </Badge>
              <Badge className={priorityColors[selectedIssue.priority]} variant="secondary">
                {selectedIssue.priority}
              </Badge>
            </div>
            <h3 className="font-medium text-gray-900">{selectedIssue.title}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {selectedIssue.location.address}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
