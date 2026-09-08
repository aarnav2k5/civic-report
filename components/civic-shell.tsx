import Link from "next/link";
import { ArrowUpRight, MapPinned, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CivicShell({
  children,
  eyebrow,
  title,
  description,
  actions,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
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
            <Link href="/issues" className="hover:text-white">
              Explore reports
            </Link>
            <Link href="/map" className="hover:text-white">
              Live map
            </Link>
            <Link href="/reports" className="hover:text-white">
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
                Report an issue
              </Link>
            </div>
          </div>
        )}
      </header>
      {(title || eyebrow) && (
        <section className="mx-auto max-w-7xl px-6 pb-10 pt-12 lg:px-10 lg:pb-14 lg:pt-16">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[.3em] text-cyan-300">
                {eyebrow}
              </p>
              {title && (
                <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[.95] tracking-[-.06em] text-white sm:text-6xl lg:text-7xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
            )}
          </div>
        </section>
      )}
      {children}
    </main>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border border-white/10 bg-[#101718]/90 shadow-[0_24px_80px_rgba(0,0,0,.18)] ${className}`}
    >
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  detail,
  accent = "text-cyan-300",
}: {
  label: string;
  value: string | number;
  detail?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
      <p className="text-xs uppercase tracking-[.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-4xl font-semibold tracking-[-.06em] ${accent}`}>
        {value}
      </p>
      {detail && <p className="mt-2 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}
