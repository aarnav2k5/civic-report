"use client"

import { useState, useEffect } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  issueId?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const mockNotifications: Notification[] = [
        {
          id: Date.now().toString(),
          title: "New Issue Reported",
          message: "Pothole reported on Meerut Road requires attention",
          type: "info",
          timestamp: new Date(),
          read: false,
          issueId: "new-issue-1",
        },
        {
          id: (Date.now() + 1).toString(),
          title: "Issue Resolved",
          message: "Streetlight repair on Ashok Vihar has been completed",
          type: "success",
          timestamp: new Date(),
          read: false,
          issueId: "resolved-issue-1",
        },
        {
          id: (Date.now() + 2).toString(),
          title: "High Priority Alert",
          message: "Water main break reported at Sahibabad - urgent response needed",
          type: "warning",
          timestamp: new Date(),
          read: false,
          issueId: "urgent-issue-1",
        },
      ]

      // Randomly add a notification every 10-30 seconds
      if (Math.random() > 0.7) {
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
        setNotifications((prev) => [randomNotification, ...prev].slice(0, 20)) // Keep only latest 20
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  }
}
