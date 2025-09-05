export interface CivicIssue {
  id: string
  title: string
  description: string
  category: IssueCategory
  priority: IssuePriority
  status: IssueStatus
  location: {
    lat: number
    lng: number
    address: string
  }
  imageUrl?: string
  reportedBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    department: string
  }
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export type IssueCategory =
  | "pothole"
  | "streetlight"
  | "trash"
  | "graffiti"
  | "sidewalk"
  | "traffic"
  | "water"
  | "other"

export type IssuePriority = "low" | "medium" | "high" | "urgent"

export type IssueStatus = "reported" | "in-progress" | "resolved" | "closed"

export interface User {
  id: string
  name: string
  email: string
  role: "citizen" | "admin" | "staff"
  department?: string
}

export interface Department {
  id: string
  name: string
  categories: IssueCategory[]
}
