"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, MapPin, Upload, CheckCircle } from "lucide-react"
import { categoryLabels, priorityLabels } from "@/lib/utils/issue-utils"
import type { IssueCategory, IssuePriority } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

export default function ReportPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as IssueCategory | "",
    priority: "medium" as IssuePriority,
    address: "",
    image: null as File | null,
  })

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

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Redirect after success
    setTimeout(() => {
      router.push("/")
    }, 3000)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setFormData({
            ...formData,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div variants={successVariants} initial="hidden" animate="visible" className="w-full max-w-md">
            <Card className="text-center bg-card/90 backdrop-blur-sm shadow-2xl border-border">
              <CardHeader>
                <motion.div
                  className="mx-auto w-20 h-20 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full flex items-center justify-center mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                >
                  <CheckCircle className="w-10 h-10 text-secondary" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <CardTitle className="text-2xl bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                    Report Submitted!
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Thank you for helping improve our community. Your report has been received and will be reviewed by
                    the appropriate department.
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <p className="text-sm text-muted-foreground mb-6">
                    You'll receive updates on the progress via email. Redirecting to homepage...
                  </p>
                  <Link href="/">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-lg text-white border-0">
                        Return to Homepage
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    )
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="mr-4 hover:bg-muted text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </motion.div>
            </Link>
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Report an Issue
              </h1>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div className="max-w-2xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Card className="bg-card/90 backdrop-blur-sm shadow-xl border-border">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Tell us about the issue
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Provide as much detail as possible to help us understand and resolve the problem quickly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Title */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="title" className="text-sm font-medium text-foreground">
                      Issue Title *
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Input
                        id="title"
                        placeholder="Brief description of the issue"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="bg-input border-border focus:border-primary focus:ring-primary/20"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Category */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="category" className="text-sm font-medium text-foreground">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as IssueCategory })}
                      required
                    >
                      <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Priority */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="priority" className="text-sm font-medium text-foreground">
                      Priority Level
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value as IssuePriority })}
                    >
                      <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Location */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="address" className="text-sm font-medium text-foreground">
                      Location *
                    </Label>
                    <div className="flex gap-2">
                      <motion.div
                        className="flex-1"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Input
                          id="address"
                          placeholder="Street address or intersection"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                          className="bg-input border-border focus:border-primary focus:ring-primary/20"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          className="border-border hover:bg-muted bg-transparent text-foreground"
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="description" className="text-sm font-medium text-foreground">
                      Description *
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about the issue, including when you noticed it and any safety concerns"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="bg-input border-border focus:border-primary focus:ring-primary/20 resize-none"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Image Upload */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="image" className="text-sm font-medium text-foreground">
                      Photo (Optional)
                    </Label>
                    <motion.div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30"
                      whileHover={{
                        borderColor: "hsl(var(--primary))",
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <label htmlFor="image" className="cursor-pointer">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                        </motion.div>
                        <p className="text-sm text-foreground font-medium">
                          {formData.image ? formData.image.name : "Click to upload a photo"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                      </label>
                    </motion.div>
                    <AnimatePresence>
                      {formData.image && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge variant="secondary" className="mt-2 bg-primary/20 text-primary border-primary/30">
                            Photo selected: {formData.image.name}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div className="pt-6" variants={itemVariants}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl text-lg py-6 text-white border-0"
                        disabled={
                          isSubmitting ||
                          !formData.title ||
                          !formData.category ||
                          !formData.address ||
                          !formData.description
                        }
                      >
                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <motion.div
                              key="submitting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <motion.div
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              />
                              Submitting Report...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="submit"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Camera className="w-5 h-5 mr-3" />
                              Submit Report
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div variants={itemVariants}>
            <Card className="mt-8 bg-card/90 backdrop-blur-sm shadow-xl border-border">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Tips for Better Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Camera className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-foreground">Take a clear photo</p>
                    <p className="text-sm text-muted-foreground">
                      Photos help staff understand the issue better and prioritize repairs
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <MapPin className="w-6 h-6 text-secondary mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-foreground">Be specific about location</p>
                    <p className="text-sm text-muted-foreground">
                      Include nearby landmarks, intersections, or building numbers
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
