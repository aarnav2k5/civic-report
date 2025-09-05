"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Filter,
  Search,
  Eye,
  UserCheck,
  Settings,
  Download,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react"
import { mockIssues, mockUsers, mockDepartments } from "@/lib/mock-data"
import { categoryLabels, statusColors, priorityColors, getTimeAgo, formatDate } from "@/lib/utils/issue-utils"
import type { IssueCategory, IssueStatus, IssuePriority } from "@/lib/types"
import { NotificationCenter } from "@/components/notification-center"
import { LiveUpdates } from "@/components/live-updates"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { generateAnalytics, exportAnalyticsReport } from "@/lib/analytics"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "all">("all")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  // Generate analytics data
  const analyticsData = generateAnalytics()

  // Statistics
  const totalIssues = mockIssues.length
  const activeIssues = mockIssues.filter((issue) => issue.status !== "resolved" && issue.status !== "closed").length
  const resolvedIssues = mockIssues.filter((issue) => issue.status === "resolved").length
  const highPriorityIssues = mockIssues.filter(
    (issue) => issue.priority === "high" || issue.priority === "urgent",
  ).length

  // Filter issues
  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const handleAssignIssue = (issueId: string, staffId: string) => {
    // In a real app, this would update the database
    console.log(`Assigning issue ${issueId} to staff ${staffId}`)
  }

  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    // In a real app, this would update the database
    console.log(`Updating issue ${issueId} status to ${newStatus}`)
  }

  const handleExportReport = () => {
    const report = exportAnalyticsReport(analyticsData)
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `civic-analytics-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <motion.header
        className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </motion.div>
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <NotificationCenter />
              <Link href="/">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="border-border hover:bg-muted bg-transparent text-foreground">
                    Public View
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <UserCheck className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground font-medium">Navya Garg</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur-sm border-border">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="live"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                >
                  Live Updates
                </TabsTrigger>
                <TabsTrigger
                  value="issues"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                >
                  Issue Management
                </TabsTrigger>
                <TabsTrigger
                  value="departments"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                >
                  Departments
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      >
                        {totalIssues}
                      </motion.div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        All time reports
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Issues</CardTitle>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      >
                        <AlertTriangle className="h-5 w-5 text-secondary" />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                      >
                        {activeIssues}
                      </motion.div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Activity className="w-3 h-3 mr-1" />
                        Needs attention
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <CheckCircle className="h-5 w-5 text-accent" />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                      >
                        {resolvedIssues}
                      </motion.div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Successfully completed
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}>
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      >
                        <Clock className="h-5 w-5 text-destructive" />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="text-3xl font-bold text-destructive"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
                      >
                        {highPriorityIssues}
                      </motion.div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Urgent attention needed
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Recent Issues */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Recent Issues
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Latest reports requiring attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                      {mockIssues.slice(0, 5).map((issue, index) => (
                        <motion.div
                          key={issue.id}
                          variants={itemVariants}
                          whileHover={{ x: 4, scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                        >
                          {issue.imageUrl && (
                            <motion.img
                              src={issue.imageUrl || "/placeholder.svg"}
                              alt={issue.title}
                              className="w-12 h-12 rounded object-cover"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <Badge className={statusColors[issue.status]}>{issue.status}</Badge>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <Badge className={priorityColors[issue.priority]}>{issue.priority}</Badge>
                              </motion.div>
                            </div>
                            <h4 className="font-medium text-foreground truncate">{issue.title}</h4>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-primary" />
                              {issue.location.address}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{getTimeAgo(issue.createdAt)}</p>
                            <p className="text-xs text-muted-foreground">{categoryLabels[issue.category]}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Live Updates Tab */}
            <TabsContent value="live" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <LiveUpdates />
              </motion.div>
            </TabsContent>

            {/* Issue Management Tab */}
            <TabsContent value="issues" className="space-y-6">
              {/* Filters */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      <Filter className="w-5 h-5 mr-2 text-primary" />
                      Filter & Search Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input
                            placeholder="Search issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-input border-border focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Category</label>
                        <Select
                          value={categoryFilter}
                          onValueChange={(value) => setCategoryFilter(value as IssueCategory | "all")}
                        >
                          <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(categoryLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Status</label>
                        <Select
                          value={statusFilter}
                          onValueChange={(value) => setStatusFilter(value as IssueStatus | "all")}
                        >
                          <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="reported">Reported</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Priority</label>
                        <Select
                          value={priorityFilter}
                          onValueChange={(value) => setPriorityFilter(value as IssuePriority | "all")}
                        >
                          <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Issues Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Issue Management ({filteredIssues.length} issues)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                      <AnimatePresence>
                        {filteredIssues.map((issue, index) => (
                          <motion.div
                            key={issue.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="border border-border rounded-lg p-4 space-y-4 bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                {issue.imageUrl && (
                                  <motion.img
                                    src={issue.imageUrl || "/placeholder.svg"}
                                    alt={issue.title}
                                    className="w-16 h-16 rounded object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <motion.div whileHover={{ scale: 1.1 }}>
                                      <Badge className={statusColors[issue.status]}>{issue.status}</Badge>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }}>
                                      <Badge className={priorityColors[issue.priority]}>{issue.priority}</Badge>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }}>
                                      <Badge variant="outline" className="border-border text-foreground">
                                        {categoryLabels[issue.category]}
                                      </Badge>
                                    </motion.div>
                                  </div>
                                  <h4 className="font-semibold text-foreground mb-1">{issue.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                    <span className="flex items-center">
                                      <MapPin className="w-3 h-3 mr-1 text-primary" />
                                      {issue.location.address}
                                    </span>
                                    <span>Reported: {formatDate(issue.createdAt)}</span>
                                    <span>By: {issue.reportedBy.name}</span>
                                  </div>
                                </div>
                              </div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-border hover:bg-muted bg-transparent text-foreground"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </motion.div>
                            </div>

                            {/* Admin Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <label className="text-sm font-medium text-foreground">Assign to:</label>
                                  <Select
                                    defaultValue={issue.assignedTo?.id || ""}
                                    onValueChange={(value) => handleAssignIssue(issue.id, value)}
                                  >
                                    <SelectTrigger className="w-40 bg-input border-border">
                                      <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockUsers
                                        .filter((user) => user.role === "staff")
                                        .map((staff) => (
                                          <SelectItem key={staff.id} value={staff.id}>
                                            {staff.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <label className="text-sm font-medium text-foreground">Status:</label>
                                  <Select
                                    defaultValue={issue.status}
                                    onValueChange={(value) => handleUpdateStatus(issue.id, value as IssueStatus)}
                                  >
                                    <SelectTrigger className="w-32 bg-input border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="reported">Reported</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              {issue.assignedTo && (
                                <div className="text-sm text-muted-foreground">
                                  Assigned to:{" "}
                                  <span className="font-medium text-foreground">{issue.assignedTo.name}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Departments Tab */}
            <TabsContent value="departments" className="space-y-6">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {mockDepartments.map((department, index) => {
                  const departmentIssues = mockIssues.filter((issue) => department.categories.includes(issue.category))
                  const activeCount = departmentIssues.filter(
                    (issue) => issue.status !== "resolved" && issue.status !== "closed",
                  ).length

                  return (
                    <motion.div
                      key={department.id}
                      variants={itemVariants}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            {department.name}
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <Badge variant="outline" className="border-border text-foreground">
                                {departmentIssues.length} issues
                              </Badge>
                            </motion.div>
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {department.categories.map((cat) => categoryLabels[cat]).join(", ")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <motion.div
                              className="flex justify-between text-sm"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <span className="text-foreground">Active Issues:</span>
                              <span className="font-medium text-secondary">{activeCount}</span>
                            </motion.div>
                            <motion.div
                              className="flex justify-between text-sm"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <span className="text-foreground">Resolved:</span>
                              <span className="font-medium text-accent">{departmentIssues.length - activeCount}</span>
                            </motion.div>
                            <motion.div
                              className="flex justify-between text-sm"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <span className="text-foreground">Staff Members:</span>
                              <span className="font-medium text-primary flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {mockUsers.filter((user) => user.department === department.name).length}
                              </span>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Analytics & Reporting
                  </h2>
                  <p className="text-muted-foreground text-lg">Comprehensive insights into civic issue management</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleExportReport}
                    className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl text-white border-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <AnalyticsCharts data={analyticsData} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
