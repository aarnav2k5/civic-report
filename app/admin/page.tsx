"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { CivicShell, Metric, Surface } from "@/components/civic-shell";
import { loadIssues, updateIssue } from "@/lib/issue-store";
import { generateAnalytics } from "@/lib/analytics";
import {
  categoryLabels,
  formatDate,
  priorityLabels,
  statusLabels,
} from "@/lib/utils/issue-utils";
import { mockDepartments } from "@/lib/mock-data";
import type {
  CivicIssue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  User,
} from "@/lib/types";

type Panel = "overview" | "queue" | "departments";
export default function AdminDashboard() {
  const router = useRouter();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [panel, setPanel] = useState<Panel>("overview");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IssueCategory | "all">("all");
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [priority, setPriority] = useState<IssuePriority | "all">("all");
  useEffect(() => {
    const sync = () => void loadIssues().then(setIssues);
    sync();
    void Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/users?role=staff"),
    ]).then(async ([me, people]) => {
      if (!me.ok) return router.replace("/login");
      const result = await me.json();
      setUser(result.user);
      if (people.ok) setStaff(await people.json());
    });
    window.addEventListener("civic-report:issues-updated", sync);
    return () =>
      window.removeEventListener("civic-report:issues-updated", sync);
  }, [router]);
  const data = useMemo(() => generateAnalytics(issues), [issues]);
  const filtered = useMemo(
    () =>
      issues.filter((issue) => {
        const term = search.trim().toLowerCase();
        return (
          (!term ||
            `${issue.title} ${issue.description} ${issue.location.address}`
              .toLowerCase()
              .includes(term)) &&
          (category === "all" || issue.category === category) &&
          (status === "all" || issue.status === status) &&
          (priority === "all" || issue.priority === priority)
        );
      }),
    [category, issues, priority, search, status],
  );
  const changeStatus = async (id: string, value: IssueStatus) => {
    const updated = await updateIssue(id, { status: value });
    setIssues((current) =>
      current.map((issue) => (issue.id === updated.id ? updated : issue)),
    );
  };
  const assign = async (id: string, value: string) => {
    const person = staff.find((member) => member.id === value);
    if (!person) return;
    const updated = await updateIssue(id, {
      assignedTo: {
        id: person.id,
        name: person.name,
        department: person.department ?? "Civic Services",
      },
    });
    setIssues((current) =>
      current.map((issue) => (issue.id === updated.id ? updated : issue)),
    );
  };
  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "queue", label: "Triage queue", icon: ClipboardList },
    { key: "departments", label: "Departments", icon: Users },
  ] as const;
  return (
    <CivicShell
      eyebrow="Operations console"
      title={
        <>
          Keep the city
          <br />
          <span className="text-slate-500">moving forward.</span>
        </>
      }
      description={
        user
          ? `Good to see you, ${user.name}. Here is the work that needs a clear next step.`
          : "A focused workspace for the teams turning public signals into visible progress."
      }
      actions={
        <Button
          onClick={() => router.push("/reports")}
          variant="outline"
          className="rounded-full border-white/15 bg-white/[.04] text-white hover:bg-white/10"
        >
          Open city insights <ArrowUpRight className="ml-2 size-4" />
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5 px-6 pb-24 lg:px-10">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPanel(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${panel === key ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:bg-white/[.06] hover:text-white"}`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        {panel === "overview" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="All signals"
                value={issues.length}
                detail="Across the public record"
              />
              <Metric
                label="Needs attention"
                value={data.activeIssues}
                detail="Open or in progress"
                accent="text-amber-200"
              />
              <Metric
                label="Resolved"
                value={data.resolvedIssues}
                detail="Completed outcomes"
                accent="text-emerald-300"
              />
              <Metric
                label="High priority"
                value={
                  issues.filter(
                    (issue) =>
                      issue.priority === "high" || issue.priority === "urgent",
                  ).length
                }
                detail="Escalation candidates"
                accent="text-rose-200"
              />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
              <Surface className="p-6">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                      Workboard
                    </p>
                    <h2 className="mt-2 text-2xl font-medium">
                      Reports that need a hand
                    </h2>
                  </div>
                  <Activity className="size-5 text-cyan-300" />
                </div>
                <div className="space-y-3">
                  {issues
                    .filter(
                      (issue) => !["resolved", "closed"].includes(issue.status),
                    )
                    .slice(0, 5)
                    .map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => setPanel("queue")}
                        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3 text-left hover:border-cyan-300/30"
                      >
                        <div
                          className={`grid size-10 shrink-0 place-items-center rounded-xl ${issue.priority === "urgent" || issue.priority === "high" ? "bg-rose-300/15 text-rose-200" : "bg-cyan-300/15 text-cyan-300"}`}
                        >
                          <AlertTriangle className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">
                            {issue.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                            <MapPin className="size-3" />
                            {issue.location.address}
                          </p>
                        </div>
                        <Badge className="border-white/10 bg-white/[.06] text-slate-300">
                          {statusLabels[issue.status]}
                        </Badge>
                      </button>
                    ))}
                  {!issues.length && (
                    <p className="text-sm text-slate-500">
                      No live reports are available.
                    </p>
                  )}
                </div>
              </Surface>
              <Surface className="p-6">
                <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                  Coverage
                </p>
                <h2 className="mt-2 text-2xl font-medium">Teams in the loop</h2>
                <div className="mt-7 space-y-5">
                  {mockDepartments.map((department) => {
                    const total = issues.filter((issue) =>
                      department.categories.includes(issue.category),
                    ).length;
                    const resolved = issues.filter(
                      (issue) =>
                        department.categories.includes(issue.category) &&
                        ["resolved", "closed"].includes(issue.status),
                    ).length;
                    return (
                      <div key={department.id}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-300">
                            {department.name}
                          </span>
                          <span className="text-slate-500">
                            {resolved}/{total}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[.07]">
                          <div
                            className="h-full rounded-full bg-cyan-300"
                            style={{
                              width: `${total ? (resolved / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Surface>
            </div>
          </>
        )}
        {panel === "queue" && (
          <Surface className="overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                    Triage queue
                  </p>
                  <h2 className="mt-2 text-2xl font-medium">
                    Every signal, one next step
                  </h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  <div className="relative sm:col-span-2">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search reports"
                      className="h-10 border-white/10 bg-white/[.04] pl-9 text-white placeholder:text-slate-600"
                    />
                  </div>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as IssueStatus | "all")
                    }
                  >
                    <SelectTrigger className="h-10 border-white/10 bg-white/[.04] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any status</SelectItem>
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
                    <SelectTrigger className="h-10 border-white/10 bg-white/[.04] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any priority</SelectItem>
                      {Object.entries(priorityLabels).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {filtered.map((issue) => (
                <article
                  key={issue.id}
                  className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div className="flex gap-4">
                    <div className="hidden size-12 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300 sm:grid">
                      <Settings2 className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge className="border-white/10 bg-white/[.06] text-slate-300">
                          {statusLabels[issue.status]}
                        </Badge>
                        <Badge className="border-white/10 bg-white/[.06] text-slate-300">
                          {priorityLabels[issue.priority]}
                        </Badge>
                        <Badge className="border-white/10 bg-white/[.06] text-slate-400">
                          {categoryLabels[issue.category]}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        {issue.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        {issue.description}
                      </p>
                      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {issue.location.address}
                        </span>
                        <span>{formatDate(issue.createdAt)}</span>
                        <span>Reported by {issue.reportedBy.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Select
                      value={issue.status}
                      onValueChange={(value) =>
                        void changeStatus(issue.id, value as IssueStatus)
                      }
                    >
                      <SelectTrigger className="w-36 border-white/10 bg-white/[.04] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={issue.assignedTo?.id ?? "unassigned"}
                      onValueChange={(value) => {
                        if (value !== "unassigned")
                          void assign(issue.id, value);
                      }}
                    >
                      <SelectTrigger className="w-40 border-white/10 bg-white/[.04] text-white">
                        <SelectValue placeholder="Assign owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </article>
              ))}
              {!filtered.length && (
                <div className="p-12 text-center text-sm text-slate-500">
                  No reports match this queue.
                </div>
              )}
            </div>
          </Surface>
        )}
        {panel === "departments" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockDepartments.map((department) => {
              const related = issues.filter((issue) =>
                department.categories.includes(issue.category),
              );
              const active = related.filter(
                (issue) => !["resolved", "closed"].includes(issue.status),
              ).length;
              return (
                <Surface key={department.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                      <Users className="size-5" />
                    </div>
                    <span className="text-xs text-slate-500">
                      {related.length} signals
                    </span>
                  </div>
                  <h2 className="mt-6 text-xl font-medium">
                    {department.name}
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                    {department.categories
                      .map((value) => categoryLabels[value])
                      .join(" · ")}
                  </p>
                  <div className="mt-6 flex justify-between border-t border-white/10 pt-4 text-sm">
                    <span className="text-slate-500">Active</span>
                    <span className="text-amber-200">{active}</span>
                  </div>
                </Surface>
              );
            })}
          </div>
        )}
      </div>
    </CivicShell>
  );
}
