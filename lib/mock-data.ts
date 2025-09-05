import type { CivicIssue, User, Department } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Aarnav Jaiswal",
    email: "aarnavj@gmail.com",
    role: "citizen",
  },
  {
    id: "2",
    name: "Navya Garg",
    email: "Navya@admin.gov",
    role: "admin",
  },
  {
    id: "3",
    name: "Aalekh Chaudhary",
    email: "Aalekh@PWD.gov",
    role: "staff",
    department: "Public Works",
  },
]

export const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Public Works",
    categories: ["pothole", "sidewalk", "streetlight"],
  },
  {
    id: "2",
    name: "Sanitation",
    categories: ["trash"],
  },
  {
    id: "3",
    name: "Transportation",
    categories: ["traffic"],
  },
  {
    id: "4",
    name: "Utilities",
    categories: ["water"],
  },
]

export const mockIssues: CivicIssue[] = [
  {
    id: "1",
    title: "Large pothole on Main Street",
    description: "Deep pothole causing damage to vehicles near the intersection",
    category: "pothole",
    priority: "high",
    status: "reported",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "Meerut Rd, Ghaziabad, Uttar Pradesh 201206",
    },
    imageUrl: "/street-pothole.png",
    reportedBy: mockUsers[0],
    createdAt: new Date("2025-01-15T10:30:00Z"),
    updatedAt: new Date("2025-03-15T10:30:00Z"),
  },
  {
    id: "2",
    title: "Broken streetlight",
    description: "Streetlight has been out for several days, creating safety concerns",
    category: "streetlight",
    priority: "medium",
    status: "in-progress",
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: "Sector Delta-1, Greater Noida",
    },
    imageUrl: "/broken-streetlight-night.png",
    reportedBy: mockUsers[0],
    assignedTo: mockUsers[2],
    createdAt: new Date("2025-04-14T14:20:00Z"),
    updatedAt: new Date("2025-05-15T09:15:00Z"),
  },
  {
    id: "3",
    title: "Overflowing trash bin",
    description: "Trash bin at bus stop is overflowing, attracting pests",
    category: "trash",
    priority: "medium",
    status: "resolved",
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: "Sangam Vihar, New Delhi",
    },
    imageUrl: "/overflowing-public-trash-bin.jpg",
    reportedBy: mockUsers[0],
    assignedTo: mockUsers[2],
    createdAt: new Date("2025-03-13T16:45:00Z"),
    updatedAt: new Date("2025-06-14T11:30:00Z"),
    resolvedAt: new Date("2025-07-14T11:30:00Z"),
  },
]
