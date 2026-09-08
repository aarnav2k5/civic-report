"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Crosshair,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CivicShell, Surface } from "@/components/civic-shell";
import { loadIssues } from "@/lib/issue-store";
import {
  categoryLabels,
  getTimeAgo,
  priorityLabels,
  statusLabels,
} from "@/lib/utils/issue-utils";
import type { CivicIssue, IssuePriority, IssueStatus } from "@/lib/types";
import { mockIssues } from "@/lib/mock-data";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export default function MapPage() {
  const [issues, setIssues] = useState<CivicIssue[]>(mockIssues);
  const [selected, setSelected] = useState<CivicIssue | null>(
    mockIssues[0] ?? null,
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [priority, setPriority] = useState<IssuePriority | "all">("all");
  const [zoom, setZoom] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [message, setMessage] = useState(
    "Markers are positioned from saved report coordinates.",
  );
  useEffect(() => {
    const sync = async () => {
      const next = await loadIssues();
      setIssues(next);
      setSelected(
        (current) =>
          next.find((issue) => issue.id === current?.id) ?? next[0] ?? null,
      );
    };
    void sync();
    window.addEventListener("civic-report:issues-updated", sync);
    return () =>
      window.removeEventListener("civic-report:issues-updated", sync);
  }, []);
  const filtered = useMemo(
    () =>
      issues.filter((issue) => {
        const term = search.trim().toLowerCase();
        return (
          (!term ||
            `${issue.title} ${issue.description} ${issue.location.address}`
              .toLowerCase()
              .includes(term)) &&
          (status === "all" || issue.status === status) &&
          (priority === "all" || issue.priority === priority)
        );
      }),
    [issues, priority, search, status],
  );
  const bounds = useMemo(() => {
    const coords = filtered.map((issue) => issue.location);
    if (!coords.length) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    const lats = coords.map((coord) => coord.lat),
      lngs = coords.map((coord) => coord.lng);
    const latPad = Math.max(
        (Math.max(...lats) - Math.min(...lats)) * 0.18,
        0.01,
      ),
      lngPad = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.18, 0.01);
    return {
      minLat: Math.min(...lats) - latPad,
      maxLat: Math.max(...lats) + latPad,
      minLng: Math.min(...lngs) - lngPad,
      maxLng: Math.max(...lngs) + lngPad,
    };
  }, [filtered]);
  const position = (lat: number, lng: number) => ({
    left: clamp(
      50 +
        (10 +
          ((lng - bounds.minLng) /
            Math.max(bounds.maxLng - bounds.minLng, 0.00001)) *
            80 -
          50) *
          zoom,
      5,
      95,
    ),
    top: clamp(
      50 +
        (12 +
          (1 -
            (lat - bounds.minLat) /
              Math.max(bounds.maxLat - bounds.minLat, 0.00001)) *
            76 -
          50) *
          zoom,
      7,
      93,
    ),
  });
  const locate = () => {
    if (!navigator.geolocation)
      return setMessage("Location services are not available in this browser.");
    setMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMessage("Your location is shown in blue.");
      },
      () => setMessage("Location permission was denied or unavailable."),
    );
  };
  return (
    <CivicShell
      eyebrow="Live city signal"
      title={
        <>
          Find what is
          <br />
          <span className="text-slate-500">happening near you.</span>
        </>
      }
      description="Explore the public issue stream spatially. Filter the signals, open a report, and see where the city is moving next."
      actions={
        <Button
          onClick={locate}
          variant="outline"
          className="rounded-full border-white/15 bg-white/[.04] text-white hover:bg-white/10"
        >
          <LocateFixed className="mr-2 size-4" />
          Find me
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <Surface className="overflow-hidden">
          <div className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-[1fr_170px_170px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search signals or places"
                className="h-11 border-white/10 bg-white/[.04] pl-9 text-white placeholder:text-slate-600"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as IssueStatus | "all")}
            >
              <SelectTrigger className="h-11 border-white/10 bg-white/[.04] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(statusLabels).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as IssuePriority | "all")
              }
            >
              <SelectTrigger className="h-11 border-white/10 bg-white/[.04] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {Object.entries(priorityLabels).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Zoom out"
                onClick={() => setZoom((value) => clamp(value - 0.15, 0.7, 2))}
                className="border-white/10 bg-white/[.04] text-white"
              >
                <Minus className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Reset map"
                onClick={() => setZoom(1)}
                className="border-white/10 bg-white/[.04] text-white"
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Zoom in"
                onClick={() => setZoom((value) => clamp(value + 0.15, 0.7, 2))}
                className="border-white/10 bg-white/[.04] text-white"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <section
              className="relative min-h-[620px] overflow-hidden bg-[#102329]"
              aria-label="Interactive issue map"
            >
              <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(30deg,transparent_47%,rgba(103,232,249,.12)_48%,rgba(103,232,249,.12)_50%,transparent_51%),linear-gradient(120deg,transparent_47%,rgba(103,232,249,.08)_48%,rgba(103,232,249,.08)_50%,transparent_51%),linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,rgba(255,255,255,.04)_2px,transparent_2px)] [background-size:180px_180px,240px_240px,48px_48px,48px_48px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(103,232,249,.18),transparent_35%),linear-gradient(180deg,rgba(8,12,13,.1),rgba(8,12,13,.7))]" />
              <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs text-slate-200 backdrop-blur">
                <Crosshair className="size-3 text-cyan-300" />
                {filtered.length} visible signals
              </div>
              {filtered.map((issue) => {
                const point = position(issue.location.lat, issue.location.lng);
                const resolved =
                  issue.status === "resolved" || issue.status === "closed";
                return (
                  <button
                    key={issue.id}
                    aria-label={`Show ${issue.title}`}
                    onClick={() => setSelected(issue)}
                    className={`absolute z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#dffcff] shadow-[0_0_0_8px_rgba(103,232,249,.08),0_12px_30px_rgba(0,0,0,.35)] transition hover:scale-125 ${selected?.id === issue.id ? "scale-125 ring-2 ring-cyan-300" : ""} ${resolved ? "bg-emerald-400" : issue.priority === "high" || issue.priority === "urgent" ? "bg-rose-400" : "bg-cyan-400"}`}
                    style={{ left: `${point.left}%`, top: `${point.top}%` }}
                  >
                    <MapPin className="size-4 text-slate-950" />
                  </button>
                );
              })}
              {location && (
                <span
                  className="absolute z-20 size-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cyan-300"
                  style={{
                    left: `${position(location.lat, location.lng).left}%`,
                    top: `${position(location.lat, location.lng).top}%`,
                  }}
                />
              )}
              <div className="absolute bottom-5 left-5 max-w-xs rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs leading-5 text-slate-300 backdrop-blur">
                {message}
              </div>
              <div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-black/50 p-4 text-xs text-slate-300 backdrop-blur">
                <p className="mb-3 font-medium text-white">Signal key</p>
                <p className="mb-2">
                  <i className="mr-2 inline-block size-2 rounded-full bg-cyan-400" />
                  Open
                </p>
                <p className="mb-2">
                  <i className="mr-2 inline-block size-2 rounded-full bg-rose-400" />
                  High priority
                </p>
                <p>
                  <i className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />
                  Resolved
                </p>
              </div>
            </section>
            <aside className="max-h-[620px] overflow-y-auto border-t border-white/10 bg-[#101718] lg:border-l lg:border-t-0">
              <div className="border-b border-white/10 p-5">
                <p className="text-xs uppercase tracking-[.18em] text-cyan-300">
                  Issue stream
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {filtered.length} of {issues.length} signals shown
                </p>
              </div>
              {filtered.length ? (
                filtered.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => setSelected(issue)}
                    className={`flex w-full gap-3 border-b border-white/10 p-4 text-left hover:bg-white/[.05] ${selected?.id === issue.id ? "bg-cyan-300/[.08]" : ""}`}
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                      {issue.imageUrl ? (
                        <Image
                          src={issue.imageUrl}
                          alt=""
                          width={56}
                          height={56}
                          unoptimized
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <MapPin className="size-5 text-cyan-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex gap-1">
                        <Badge className="border-white/10 bg-white/[.07] text-slate-200">
                          {statusLabels[issue.status]}
                        </Badge>
                        <Badge className="border-white/10 bg-white/[.07] text-slate-400">
                          {priorityLabels[issue.priority]}
                        </Badge>
                      </div>
                      <p className="truncate font-medium text-white">
                        {issue.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {categoryLabels[issue.category]} ·{" "}
                        {getTimeAgo(issue.createdAt)}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {issue.location.address}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No signals match those filters.
                </div>
              )}
            </aside>
          </div>
        </Surface>
      </div>
    </CivicShell>
  );
}
