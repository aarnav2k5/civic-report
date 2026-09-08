"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  LocateFixed,
  MapPin,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CivicShell, Surface } from "@/components/civic-shell";
import { categoryLabels } from "@/lib/utils/issue-utils";
import { createIssue } from "@/lib/issue-store";
import type { CivicIssue, IssueCategory, IssuePriority } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [form, setForm] = useState({
    title: "",
    email: "",
    category: "" as IssueCategory | "",
    priority: "medium" as IssuePriority,
    address: "",
    description: "",
    lat: null as number | null,
    lng: null as number | null,
    image: null as File | null,
  });
  const set = (key: string, value: string | number | File | null) =>
    setForm((current) => ({ ...current, [key]: value }));
  const locate = () => {
    if (!navigator.geolocation)
      return setLocationError(
        "Location services are unavailable in this browser.",
      );
    setLocationError("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set("lat", position.coords.latitude);
        set("lng", position.coords.longitude);
        set(
          "address",
          `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        );
        setLocationError(
          "Location captured. You can refine the address below.",
        );
      },
      () =>
        setLocationError(
          "We could not access your location. Check browser permissions.",
        ),
    );
  };
  const upload = async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body });
    if (!response.ok) throw new Error("Image upload failed");
    const result = (await response.json()) as { imageUrl?: string };
    return result.imageUrl;
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (
      !form.title.trim() ||
      !form.email.trim() ||
      !form.category ||
      !form.address.trim() ||
      !form.description.trim()
    )
      return setError("Complete the required fields before submitting.");
    setBusy(true);
    try {
      let { lat, lng, address } = form;
      if (lat === null || lng === null) {
        const response = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: address.trim() }),
        });
        if (!response.ok) throw new Error();
        const location = (await response.json()) as {
          lat: number;
          lng: number;
          address: string;
        };
        lat = location.lat;
        lng = location.lng;
        address = location.address;
      }
      const now = new Date();
      const imageUrl = form.image ? await upload(form.image) : undefined;
      const issue: CivicIssue = {
        id: `pending-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as IssueCategory,
        priority: form.priority,
        status: "reported",
        location: { lat, lng, address },
        imageUrl,
        reportedBy: {
          id: "anonymous-resident",
          name: "Anonymous resident",
          email: form.email.trim(),
        },
        createdAt: now,
        updatedAt: now,
      };
      await createIssue(issue);
      setSubmitted(true);
      setTimeout(() => router.push("/"), 2800);
    } catch {
      setError(
        "We couldn't save your report. Check the address and try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (submitted)
    return (
      <CivicShell>
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16">
          <Surface className="w-full p-8 text-center sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-300/15 text-emerald-300">
              <CheckCircle2 className="size-8" />
            </div>
            <p className="mt-7 text-xs uppercase tracking-[.28em] text-cyan-300">
              Signal received
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">
              Your report is in motion.
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Thanks for giving the city a clear starting point. The report is
              now visible to the operations team.
            </p>
            <Link
              href="/issues"
              className="mt-8 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 hover:bg-cyan-200"
            >
              Browse the issue stream <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Surface>
        </div>
      </CivicShell>
    );
  return (
    <CivicShell
      eyebrow="Make a signal"
      title={
        <>
          Give the city
          <br />
          <span className="text-slate-500">a clear starting point.</span>
        </>
      }
      description="A useful report has a location, a little context, and a way for the team to follow up. Everything else can stay simple."
    >
      <div className="mx-auto grid max-w-7xl gap-5 px-6 pb-24 lg:grid-cols-[.7fr_1.3fr] lg:px-10">
        <aside className="space-y-4">
          <Surface className="p-6">
            <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
              Good to know
            </p>
            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-cyan-300">
                  01
                </span>
                <div>
                  <p className="font-medium text-white">Name the signal</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    A short title helps the right team scan quickly.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-cyan-300">
                  02
                </span>
                <div>
                  <p className="font-medium text-white">Pin the context</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Use your address or capture your current location.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-cyan-300">
                  03
                </span>
                <div>
                  <p className="font-medium text-white">Stay in the loop</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Your contact helps the operations team follow up.
                  </p>
                </div>
              </div>
            </div>
          </Surface>
          <div className="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300 p-6 text-slate-950">
            <Camera className="size-6" />
            <p className="mt-8 text-xs uppercase tracking-[.2em] text-slate-700">
              Small signal, real change
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-.04em]">
              The clearer the context, the faster the handoff.
            </p>
          </div>
        </aside>
        <Surface className="p-6 sm:p-9">
          <form onSubmit={submit} className="space-y-7">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-slate-300">
                  Issue title <b className="text-cyan-300">*</b>
                </span>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Broken streetlight on the corner"
                  className="h-12 border-white/10 bg-white/[.04] text-white placeholder:text-slate-600"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">
                  Category <b className="text-cyan-300">*</b>
                </span>
                <Select
                  value={form.category}
                  onValueChange={(value) => set("category", value)}
                >
                  <SelectTrigger className="h-12 border-white/10 bg-white/[.04] text-white">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Priority</span>
                <Select
                  value={form.priority}
                  onValueChange={(value) => set("priority", value)}
                >
                  <SelectTrigger className="h-12 border-white/10 bg-white/[.04] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">
                What is happening? <b className="text-cyan-300">*</b>
              </span>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Add the detail a team needs to understand the situation…"
                className="min-h-36 border-white/10 bg-white/[.04] text-white placeholder:text-slate-600"
              />
            </label>
            <div className="space-y-2">
              <span className="text-sm text-slate-300">
                Where should we look? <b className="text-cyan-300">*</b>
              </span>
              <div className="flex gap-2">
                <Input
                  value={form.address}
                  onChange={(e) => {
                    set("address", e.target.value);
                    set("lat", null);
                    set("lng", null);
                  }}
                  placeholder="Street, landmark, or neighbourhood"
                  className="h-12 border-white/10 bg-white/[.04] text-white placeholder:text-slate-600"
                />
                <Button
                  type="button"
                  onClick={locate}
                  variant="outline"
                  size="icon"
                  className="size-12 shrink-0 border-white/15 bg-white/[.04] text-white hover:bg-white/10"
                  aria-label="Use current location"
                >
                  <LocateFixed className="size-4" />
                </Button>
              </div>
              {locationError && (
                <p className="text-xs text-slate-500">{locationError}</p>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">
                  Photo <span className="text-slate-500">optional</span>
                </span>
                <div className="relative flex h-12 items-center rounded-xl border border-dashed border-white/15 bg-white/[.03] px-4 text-sm text-slate-400">
                  <Upload className="mr-2 size-4 text-cyan-300" />
                  {form.image ? form.image.name : "Attach an image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size <= 10 * 1024 * 1024)
                        set("image", file);
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">
                  Email for follow-up <b className="text-cyan-300">*</b>
                </span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 border-white/10 bg-white/[.04] text-white placeholder:text-slate-600"
                />
              </label>
            </div>
            {error && (
              <div className="rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
            <div className="flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="size-4 text-cyan-300" />
                Your report will be visible on the public issue stream.
              </p>
              <Button
                disabled={busy}
                type="submit"
                className="h-12 rounded-full bg-cyan-300 px-6 text-slate-950 hover:bg-cyan-200"
              >
                {busy ? "Sending signal…" : "Submit report"}
                <ArrowUpRight className="ml-2 size-4" />
              </Button>
            </div>
          </form>
        </Surface>
      </div>
    </CivicShell>
  );
}
