"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  FileText,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CivicShell, Metric, Surface } from "@/components/civic-shell";
import { generateAnalytics, exportAnalyticsReport } from "@/lib/analytics";
import { loadIssues } from "@/lib/issue-store";
import { categoryLabels, statusLabels } from "@/lib/utils/issue-utils";
import type { CivicIssue } from "@/lib/types";

export default function ReportsPage() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [timeRange, setTimeRange] = useState("year");
  const [format, setFormat] = useState("csv");
  useEffect(() => {
    const sync = () => void loadIssues().then(setIssues);
    sync();
    window.addEventListener("civic-report:issues-updated", sync);
    return () =>
      window.removeEventListener("civic-report:issues-updated", sync);
  }, []);
  const filtered = useMemo(() => {
    const start = new Date();
    if (timeRange === "week") start.setDate(start.getDate() - 7);
    if (timeRange === "month") start.setMonth(start.getMonth() - 1);
    if (timeRange === "quarter") start.setMonth(start.getMonth() - 3);
    if (timeRange === "year") start.setFullYear(start.getFullYear() - 1);
    return issues.filter((issue) => issue.createdAt >= start);
  }, [issues, timeRange]);
  const data = useMemo(() => generateAnalytics(filtered), [filtered]);
  const download = () => {
    const report = exportAnalyticsReport(data);
    const csv = [
      "metric,value",
      `total_issues,${data.totalIssues}`,
      `active_issues,${data.activeIssues}`,
      `resolved_issues,${data.resolvedIssues}`,
      ...Object.entries(data.categoryBreakdown).map(
        ([key, value]) => `category_${key},${value}`,
      ),
    ].join("\n");
    const blob = new Blob([format === "csv" ? csv : report], {
      type: format === "csv" ? "text/csv" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `civic-insights-${new Date().toISOString().slice(0, 10)}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const rate = data.totalIssues
    ? (data.resolvedIssues / data.totalIssues) * 100
    : 0;
  const categories = Object.entries(data.categoryBreakdown).sort(
    ([, a], [, b]) => b - a,
  );
  const maxTrend = Math.max(
    1,
    ...data.monthlyTrends.flatMap((month) => [month.reported, month.resolved]),
  );
  return (
    <CivicShell
      eyebrow="City intelligence"
      title={
        <>
          See the city
          <br />
          <span className="text-slate-500">in motion.</span>
        </>
      }
      description="A clear read on what residents are reporting, what teams are resolving, and where attention is accumulating."
      actions={
        <>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 rounded-full border-white/15 bg-white/[.04] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={download}
            className="rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5 px-6 pb-24 lg:px-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Reports in view"
            value={data.totalIssues}
            detail={`${issues.length} all-time signals`}
          />
          <Metric
            label="Still active"
            value={data.activeIssues}
            detail="Needs an owner or next step"
            accent="text-amber-200"
          />
          <Metric
            label="Resolution rate"
            value={`${rate.toFixed(0)}%`}
            detail={`${data.resolvedIssues} resolved reports`}
            accent="text-emerald-300"
          />
          <Metric
            label="Average resolution"
            value={
              data.avgResolutionTime
                ? `${data.avgResolutionTime.toFixed(1)}d`
                : "—"
            }
            detail="Based on completed work"
            accent="text-violet-200"
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Surface className="p-6">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                  Signal velocity
                </p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight">
                  Reported vs resolved
                </h2>
              </div>
              <TrendingUp className="size-5 text-cyan-300" />
            </div>
            <div className="flex h-56 items-end gap-3 sm:gap-5">
              {data.monthlyTrends.map((month) => (
                <div
                  key={month.month}
                  className="flex min-w-0 flex-1 flex-col items-center gap-3"
                >
                  <div className="flex h-44 w-full items-end justify-center gap-1.5">
                    <div
                      className="w-1/2 rounded-t-md bg-cyan-300/80"
                      style={{
                        height: `${Math.max(6, (month.reported / maxTrend) * 100)}%`,
                      }}
                      title={`${month.reported} reported`}
                    />
                    <div
                      className="w-1/2 rounded-t-md bg-emerald-300/80"
                      style={{
                        height: `${Math.max(6, (month.resolved / maxTrend) * 100)}%`,
                      }}
                      title={`${month.resolved} resolved`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {month.month.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-5 text-xs text-slate-400">
              <span>
                <i className="mr-2 inline-block size-2 rounded-full bg-cyan-300" />
                Reported
              </span>
              <span>
                <i className="mr-2 inline-block size-2 rounded-full bg-emerald-300" />
                Resolved
              </span>
            </div>
          </Surface>
          <Surface className="p-6">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                  Where attention goes
                </p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight">
                  Issue mix
                </h2>
              </div>
              <BarChart3 className="size-5 text-cyan-300" />
            </div>
            <div className="space-y-5">
              {categories.length ? (
                categories.slice(0, 6).map(([category, count]) => (
                  <div key={category}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-300">
                        {
                          categoryLabels[
                            category as keyof typeof categoryLabels
                          ]
                        }
                      </span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[.07]">
                      <div
                        className="h-full rounded-full bg-cyan-300"
                        style={{
                          width: `${(count / Math.max(1, data.totalIssues)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No reports in this time range.
                </p>
              )}
            </div>
          </Surface>
        </div>
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Surface className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                  Current state
                </p>
                <h2 className="mt-2 text-2xl font-medium">Status pulse</h2>
              </div>
              <Activity className="size-5 text-cyan-300" />
            </div>
            <div className="space-y-4">
              {Object.entries(data.statusBreakdown).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.025] p-3"
                >
                  <span className="flex items-center gap-3 text-sm text-slate-300">
                    <span
                      className={`size-2 rounded-full ${status === "resolved" ? "bg-emerald-300" : status === "in-progress" ? "bg-cyan-300" : "bg-amber-200"}`}
                    />
                    {statusLabels[status as keyof typeof statusLabels]}
                  </span>
                  <span className="font-medium text-white">{count}</span>
                </div>
              ))}
            </div>
          </Surface>
          <Surface className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                  Export center
                </p>
                <h2 className="mt-2 text-2xl font-medium">
                  Take the pulse with you
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  Generate a lightweight operational snapshot for a team review,
                  a public meeting, or the next planning cycle.
                </p>
              </div>
              <FileText className="size-5 text-cyan-300" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-40 border-white/10 bg-white/[.04] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV data</SelectItem>
                  <SelectItem value="txt">Text brief</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={download}
                variant="outline"
                className="border-white/15 bg-white/[.04] text-white hover:bg-white/10"
              >
                <Download className="mr-2 size-4" />
                Download insight report
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-4">
                <ArrowUpRight className="size-4 text-cyan-300" />
                <p className="mt-4 text-xs text-slate-500">Most reported</p>
                <p className="mt-1 text-sm text-white">
                  {categories[0]
                    ? categoryLabels[
                        categories[0][0] as keyof typeof categoryLabels
                      ]
                    : "No data"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <ArrowDownRight className="size-4 text-emerald-300" />
                <p className="mt-4 text-xs text-slate-500">Resolved</p>
                <p className="mt-1 text-sm text-white">
                  {data.resolvedIssues} reports
                </p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <Timer className="size-4 text-violet-200" />
                <p className="mt-4 text-xs text-slate-500">Signal window</p>
                <p className="mt-1 text-sm text-white">
                  {timeRange === "year" ? "12 months" : timeRange}
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </CivicShell>
  );
}
