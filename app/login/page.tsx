"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error || "Unable to sign in.");
      setBusy(false);
      return;
    }
    router.push("/admin");
  }
  return (
    <main className="site-shell min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-10"
        >
          <ArrowLeft className="size-4" /> Back to CivicReport
        </Link>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-semibold tracking-tight">CivicReport</p>
              <p className="text-xs text-muted-foreground">
                Operations console
              </p>
            </div>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-cyan-300">
              Secure access
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to triage reports, update status, and coordinate
              departments.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="ops@yourcity.gov"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200"
              >
                {error}
              </p>
            )}
            <Button
              disabled={busy}
              className="h-12 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <KeyRound className="mr-2 size-4" />
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-emerald-300" />
            <p>
              Access is role-based. Credentials are read from your server
              environment and sessions are stored server-side.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
