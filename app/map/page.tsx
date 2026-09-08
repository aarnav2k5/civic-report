"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Camera, LocateFixed, MapPin, Minus, Navigation, Plus, RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockIssues } from "@/lib/mock-data"
import { categoryLabels, getTimeAgo, priorityColors, priorityLabels, statusColors, statusLabels } from "@/lib/utils/issue-utils"
import { loadIssues } from "@/lib/issue-store"
import type { CivicIssue, IssuePriority, IssueStatus } from "@/lib/types"

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function MapPage() {
  const [issues, setIssues] = useState<CivicIssue[]>(mockIssues)
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(mockIssues[0] ?? null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "all">("all")
  const [zoom, setZoom] = useState(1)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [message, setMessage] = useState("Markers are positioned from the saved report coordinates.")

  useEffect(() => {
    const sync = async () => {
      const next = await loadIssues()
      setIssues(next)
      setSelectedIssue((current) => next.find((issue) => issue.id === current?.id) ?? next[0] ?? null)
    }
    void sync()
    window.addEventListener("civic-report:issues-updated", sync)
    return () => window.removeEventListener("civic-report:issues-updated", sync)
  }, [])

  const filteredIssues = useMemo(() => issues.filter((issue) => {
    const term = search.toLowerCase().trim()
    const matchesSearch = !term || `${issue.title} ${issue.description} ${issue.location.address}`.toLowerCase().includes(term)
    return matchesSearch && (statusFilter === "all" || issue.status === statusFilter) && (priorityFilter === "all" || issue.priority === priorityFilter)
  }), [issues, priorityFilter, search, statusFilter])

  const bounds = useMemo(() => {
    const coordinates = filteredIssues.map((issue) => issue.location).filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng))
    if (!coordinates.length) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 }
    const latitudes = coordinates.map((location) => location.lat)
    const longitudes = coordinates.map((location) => location.lng)
    const latPadding = Math.max((Math.max(...latitudes) - Math.min(...latitudes)) * 0.18, 0.01)
    const lngPadding = Math.max((Math.max(...longitudes) - Math.min(...longitudes)) * 0.18, 0.01)
    return { minLat: Math.min(...latitudes) - latPadding, maxLat: Math.max(...latitudes) + latPadding, minLng: Math.min(...longitudes) - lngPadding, maxLng: Math.max(...longitudes) + lngPadding }
  }, [filteredIssues])

  const locateUser = () => {
    if (!navigator.geolocation) { setMessage("Location services are not available in this browser."); return }
    setMessage("Finding your location…")
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
      setZoom(1.25)
      setMessage("Your location is shown in blue. Report markers are based on saved coordinates.")
    }, () => setMessage("We could not access your location. Check browser permissions and try again."))
  }

  const positionFor = (lat: number, lng: number) => {
    const horizontal = (lng - bounds.minLng) / Math.max(bounds.maxLng - bounds.minLng, 0.00001)
    const vertical = 1 - (lat - bounds.minLat) / Math.max(bounds.maxLat - bounds.minLat, 0.00001)
    return { left: clamp(50 + (10 + horizontal * 80 - 50) * zoom, 5, 95), top: clamp(50 + (12 + vertical * 76 - 50) * zoom, 7, 93) }
  }

  const resetMap = () => { setZoom(1); setMessage("Map fitted to the visible issue coordinates.") }

  return <main className="site-shell min-h-screen">
    <header className="site-header"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center"><Link href="/"><Button variant="ghost" size="sm" className="mr-4"><ArrowLeft className="mr-2 size-4" />Back</Button></Link><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-cyan-300 text-slate-950"><MapPin className="size-4" /></span><h1 className="text-xl font-semibold text-white">Live issue map</h1></div></div><Link href="/report"><Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"><Camera className="mr-2 size-4" />Report issue</Button></Link></div></header>

    <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-5 lg:px-6"><div className="mb-3 grid gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 lg:grid-cols-[1fr_180px_180px_auto] lg:items-center"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports or locations" className="border-white/10 bg-black/20 pl-9 text-white placeholder:text-slate-500" /></div><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IssueStatus | "all")}><SelectTrigger className="border-white/10 bg-black/20 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as IssuePriority | "all")}><SelectTrigger className="border-white/10 bg-black/20 text-white"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{Object.entries(priorityLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><div className="flex items-center justify-end gap-2"><Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setZoom((value) => clamp(value - .15, .7, 2))}><Minus className="size-4" /></Button><Button variant="outline" size="icon" aria-label="Reset map" onClick={resetMap}><RotateCcw className="size-4" /></Button><Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setZoom((value) => clamp(value + .15, .7, 2))}><Plus className="size-4" /></Button><Button variant="outline" size="icon" aria-label="Find my location" onClick={locateUser}><LocateFixed className="size-4" /></Button></div></div>

      <div className="grid min-h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0c1213] lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="relative min-h-[620px] overflow-hidden bg-[#102329]" aria-label="Interactive issue map"><div className="absolute inset-0 opacity-80 [background-image:linear-gradient(30deg,transparent_47%,rgba(103,232,249,.12)_48%,rgba(103,232,249,.12)_50%,transparent_51%),linear-gradient(120deg,transparent_47%,rgba(103,232,249,.08)_48%,rgba(103,232,249,.08)_50%,transparent_51%),linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:180px_180px,240px_240px,48px_48px,48px_48px]" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(103,232,249,.18),transparent_35%),linear-gradient(180deg,rgba(8,12,13,.1),rgba(8,12,13,.65))]" /><div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur"><Navigation className="mr-2 inline size-4 text-cyan-300" /> {filteredIssues.length} visible reports</div>{filteredIssues.map((issue) => { const position = positionFor(issue.location.lat, issue.location.lng); return <button key={issue.id} type="button" aria-label={`Show ${issue.title}`} onClick={() => setSelectedIssue(issue)} className={`absolute z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white/80 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition hover:scale-125 focus:outline-none focus:ring-2 focus:ring-cyan-300 ${selectedIssue?.id === issue.id ? "scale-125 ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#102329]" : ""} ${issue.status === "resolved" || issue.status === "closed" ? "bg-emerald-500" : issue.priority === "high" || issue.priority === "urgent" ? "bg-red-500" : "bg-cyan-500"}`} style={{ left: `${position.left}%`, top: `${position.top}%` }}><MapPin className="size-4 text-white" /></button> })}{userLocation && <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${positionFor(userLocation.lat, userLocation.lng).left}%`, top: `${positionFor(userLocation.lat, userLocation.lng).top}%` }}><span className="block size-5 animate-ping rounded-full bg-cyan-300/60" /><span className="absolute left-1/2 top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-300" /></div>}<div className="absolute bottom-5 left-5 max-w-sm rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs leading-5 text-slate-300 backdrop-blur">{message}</div><div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-slate-300 backdrop-blur"><div className="mb-2 font-medium text-white">Legend</div><div className="space-y-2"><div><span className="mr-2 inline-block size-2.5 rounded-full bg-red-500" />High priority</div><div><span className="mr-2 inline-block size-2.5 rounded-full bg-cyan-500" />Open</div><div><span className="mr-2 inline-block size-2.5 rounded-full bg-emerald-500" />Resolved</div></div></div></section>

        <aside className="border-t border-white/10 bg-[#101718] lg:border-l lg:border-t-0"><div className="border-b border-white/10 p-5"><h2 className="font-semibold text-white">Reports near you</h2><p className="mt-1 text-sm text-slate-400">{filteredIssues.length} of {issues.length} reports shown</p></div><div className="max-h-[calc(100vh-14rem)] divide-y divide-white/10 overflow-y-auto">{filteredIssues.length === 0 ? <div className="p-8 text-center"><MapPin className="mx-auto mb-3 size-8 text-slate-500" /><p className="font-medium text-white">No reports match</p><p className="mt-1 text-sm text-slate-400">Try clearing a filter or changing your search.</p></div> : filteredIssues.map((issue) => <button key={issue.id} type="button" onClick={() => setSelectedIssue(issue)} className={`flex w-full gap-3 p-4 text-left transition hover:bg-white/[.06] ${selectedIssue?.id === issue.id ? "bg-cyan-300/[.08]" : ""}`}><div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-900">{issue.imageUrl ? <Image src={issue.imageUrl} alt="" width={56} height={56} unoptimized className="size-full object-cover" /> : <div className="grid size-full place-items-center"><MapPin className="size-5 text-cyan-300" /></div>}</div><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap gap-1"><Badge className={statusColors[issue.status]}>{statusLabels[issue.status]}</Badge><Badge className={priorityColors[issue.priority]}>{priorityLabels[issue.priority]}</Badge></div><h3 className="truncate font-medium text-white">{issue.title}</h3><p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-400"><MapPin className="size-3 shrink-0" />{issue.location.address}</p><p className="mt-1 text-xs text-slate-500">{categoryLabels[issue.category]} · {getTimeAgo(issue.createdAt)}</p></div></button>)}</div></aside>
      </div>
    </div>
    {selectedIssue && <div className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-white/10 bg-[#101718]/95 p-4 shadow-2xl backdrop-blur lg:hidden"><div className="flex items-start justify-between gap-3"><div><div className="mb-2 flex gap-1"><Badge className={statusColors[selectedIssue.status]}>{statusLabels[selectedIssue.status]}</Badge><Badge className={priorityColors[selectedIssue.priority]}>{priorityLabels[selectedIssue.priority]}</Badge></div><h3 className="font-medium text-white">{selectedIssue.title}</h3><p className="mt-1 text-sm text-slate-400">{selectedIssue.location.address}</p></div><button className="text-slate-400" onClick={() => setSelectedIssue(null)} aria-label="Close selected issue">×</button></div></div>}
  </main>
}
