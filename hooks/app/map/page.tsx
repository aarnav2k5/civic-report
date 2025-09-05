"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Camera, Navigation } from "lucide-react"
import { mockIssues } from "@/lib/mock-data"
import { categoryLabels, statusColors, priorityColors, getTimeAgo } from "@/lib/utils/issue-utils"

export default function MapPage() {
  const [selectedIssue, setSelectedIssue] = useState(mockIssues[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
          {/* Placeholder for interactive map */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="text-center">
              <Navigation className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Map</h3>
              <p className="text-gray-600 max-w-md">
                In a production app, this would show an interactive map with issue markers. Click on issues in the
                sidebar to see their locations.
              </p>
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
            <p className="text-sm text-gray-600 mt-1">{mockIssues.length} issues found</p>
          </div>

          <div className="divide-y">
            {mockIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedIssue?.id === issue.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start space-x-3">
                  {issue.imageUrl && (
                    <img
                      src={issue.imageUrl || "/placeholder.svg"}
                      alt={issue.title}
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
