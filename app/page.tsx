"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Clock3,
  MapPinned,
  Menu,
  MoveUpRight,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadIssues } from "@/lib/issue-store";
import {
  categoryLabels,
  getTimeAgo,
  statusLabels,
} from "@/lib/utils/issue-utils";
import type { CivicIssue } from "@/lib/types";

export default function HomePage() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const sync = () => void loadIssues().then(setIssues);
    sync();
    window.addEventListener("civic-report:issues-updated", sync);
    return () =>
      window.removeEventListener("civic-report:issues-updated", sync);
  }, []);
  const active = issues.filter(
    (issue) => !["resolved", "closed"].includes(issue.status),
  ).length;
  const resolved = issues.filter(
    (issue) => issue.status === "resolved" || issue.status === "closed",
  ).length;
  const recent = issues.slice(0, 3);

  return (
    <main className="site-shell min-h-screen overflow-hidden">
      <header className="site-header">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,.25)]">
              <MapPinned className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              CivicReport<span className="text-cyan-300">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <Link href="/issues" className="transition hover:text-white">
              Explore reports
            </Link>
            <Link href="/map" className="transition hover:text-white">
              Live map
            </Link>
            <Link href="/reports" className="transition hover:text-white">
              City insights
            </Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Staff login
            </Link>
            <Link href="/report">
              <Button className="rounded-full bg-white px-5 text-slate-950 hover:bg-cyan-200">
                Report an issue <ArrowUpRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
          <button
            aria-label="Toggle menu"
            className="md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 px-6 py-5 md:hidden">
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <Link href="/issues">Explore reports</Link>
              <Link href="/map">Live map</Link>
              <Link href="/reports">City insights</Link>
              <Link href="/login">Staff login</Link>
              <Link href="/report" className="text-cyan-300">
                Report an issue <ArrowUpRight className="inline size-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-24 top-8 size-[34rem] rounded-full bg-cyan-300/10 blur-[120px]" />
        <div className="relative grid items-end gap-14 lg:grid-cols-[1.12fr_.88fr] lg:gap-20">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-7 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-300"
            >
              <Sparkles className="size-4" /> The civic operating layer
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="max-w-4xl text-6xl font-semibold leading-[.95] tracking-[-.06em] text-white sm:text-7xl lg:text-[7.6rem]"
            >
              Make your
              <br />
              <span className="text-slate-500">city visible.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-9 max-w-xl text-lg leading-8 text-slate-400"
            >
              A clearer line between the places people live and the teams who
              keep them moving. Report what needs attention. Follow what happens
              next.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link href="/report">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-cyan-300 px-7 text-base text-slate-950 hover:bg-cyan-200"
                >
                  Start a report <MoveUpRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Link href="/map">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-white/15 bg-white/[.04] px-7 text-base text-white hover:bg-white/10"
                >
                  See the live map
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101718] p-5 shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(103,232,249,.18),transparent_30%)]" />
            <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[.22em] text-slate-500">
                  Community pulse
                </p>
                <p className="mt-2 text-2xl font-medium">What needs us now</p>
              </div>
              <span className="size-3 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_16px_#86efac]" />
            </div>
            <div className="relative py-7">
              <div className="mb-7 flex items-end gap-3">
                <span className="text-7xl font-semibold tracking-[-.06em] text-white">
                  {active}
                </span>
                <span className="mb-2 text-sm text-slate-400">
                  active
                  <br />
                  reports
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <p className="text-xs text-slate-500">All reports</p>
                  <p className="mt-2 text-2xl font-medium">{issues.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <p className="text-xs text-slate-500">Resolved</p>
                  <p className="mt-2 text-2xl font-medium text-emerald-300">
                    {resolved}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/issues"
              className="relative flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 hover:bg-cyan-200"
            >
              Browse the issue stream <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-7 text-sm sm:grid-cols-3 lg:px-10">
          <div className="flex items-center gap-3 text-slate-300">
            <Camera className="size-4 text-cyan-300" /> One report, with the
            context teams need
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Clock3 className="size-4 text-cyan-300" /> Every status change
            stays visible
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="size-4 text-cyan-300" /> A public record of
            progress
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.28em] text-cyan-300">
              In the city
            </p>
            <h2 className="mt-3 text-4xl font-medium tracking-[-.04em]">
              Latest signals
            </h2>
          </div>
          <Link
            href="/issues"
            className="hidden items-center gap-2 text-sm text-slate-400 hover:text-white sm:flex"
          >
            View all reports <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {recent.length === 0
            ? [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-[1.5rem] bg-white/[.05]"
                />
              ))
            : recent.map((issue, index) => (
                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  key={issue.id}
                  className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101718] transition hover:-translate-y-1 hover:border-cyan-300/40"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    {issue.imageUrl ? (
                      <Image
                        src={issue.imageUrl}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="h-full bg-[radial-gradient(circle_at_30%_30%,rgba(103,232,249,.35),transparent_20%),linear-gradient(135deg,#142326,#0b1112)]" />
                    )}
                    <div className="absolute left-4 top-4">
                      <Badge className="border-0 bg-black/50 text-white backdrop-blur">
                        {statusLabels[issue.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[.18em] text-cyan-300">
                        {categoryLabels[issue.category]}
                      </p>
                      <span className="text-xs text-slate-500">
                        {getTimeAgo(issue.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 line-clamp-1 text-xl font-medium tracking-tight">
                      {issue.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                      {issue.description}
                    </p>
                    <p className="mt-5 truncate text-xs text-slate-500">
                      {issue.location.address}
                    </p>
                  </div>
                </motion.article>
              ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-cyan-300 px-7 py-12 text-slate-950 sm:px-12">
          <div className="absolute -right-10 -top-20 size-72 rounded-full border-[40px] border-slate-950/10" />
          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-[.28em] text-slate-700">
              Small signal, real change
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">
              Your next report can move a whole block.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-800">
              Add a location, a little context, and a way to reach you. The
              right people get a clear starting point.
            </p>
            <Link
              href="/report"
              className="mt-8 inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Report an issue <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} CivicReport</span>
          <span>Built for clearer, more accountable cities.</span>
        </div>
      </footer>
    </main>
  );
}
