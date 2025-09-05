"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Camera, BarChart3, AlertTriangle, CheckCircle, Users, Clock, TrendingUp } from "lucide-react"
import { mockIssues } from "@/lib/mock-data"
import { statusColors, getTimeAgo } from "@/lib/utils/issue-utils"
import { motion } from "framer-motion"

export default function HomePage() {
  const recentIssues = mockIssues.slice(0, 3)
  const totalIssues = mockIssues.length
  const resolvedIssues = mockIssues.filter((issue) => issue.status === "resolved").length
  const activeIssues = mockIssues.filter((issue) => issue.status !== "resolved" && issue.status !== "closed").length

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CivicReport
              </h1>
            </motion.div>
            <nav className="flex items-center space-x-4">
              <Link href="/report">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl text-white border-0 font-medium">
                    <Camera className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </motion.div>
              </Link>
              <Link href="/admin">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="border-border hover:bg-muted bg-transparent text-foreground">
                    Admin Dashboard
                  </Button>
                </motion.div>
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, #164e63 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #0891b2 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, #00bcd4 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, #164e63 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2
            className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Together, We Build Better Cities
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Report civic issues in your neighborhood and track their resolution. Together, we can make our city better
            for everyone.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/report">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 shadow-xl hover:shadow-2xl w-full sm:w-auto text-lg px-8 py-6 text-white border-0 font-medium"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Report an Issue
                </Button>
              </motion.div>
            </Link>
            <Link href="/map">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 bg-card/50 backdrop-blur-sm border-border hover:bg-muted text-foreground"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  View Issue Map
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="card-hover bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    {totalIssues}
                  </motion.div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Issues reported this month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-hover bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl">
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
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                  >
                    {activeIssues}
                  </motion.div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Currently being addressed
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-hover bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                  <motion.div whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                  >
                    {resolvedIssues}
                  </motion.div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    Issues successfully resolved
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Recent Issues */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Recent Reports
            </h3>
            <Link href="/issues">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="border-border hover:bg-muted bg-transparent text-foreground">
                  View All Issues
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {recentIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-2xl transition-all duration-300">
                  <motion.div
                    className="aspect-video relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={issue.imageUrl || "/placeholder.svg"}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Badge className={`${statusColors[issue.status]} shadow-sm`}>{issue.status}</Badge>
                      </motion.div>
                      <span className="text-sm text-muted-foreground">{getTimeAgo(issue.createdAt)}</span>
                    </div>
                    <CardTitle className="text-lg text-foreground mb-2">{issue.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {issue.location.address}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-card/80 backdrop-blur-sm border-t border-border mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center space-x-3 mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold text-lg">
                CivicReport
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground">© 2025 CivicReport. Making communities better together.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
