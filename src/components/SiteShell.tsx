import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShieldCheck, User } from "lucide-react";
import { useRobloxSession } from "@/lib/roblox-session";

function HeaderAvatar() {
  const { session, loading } = useRobloxSession();
  if (loading || !session) {
    return (
      <Link to="/login" className="rounded-full border border-glass-border bg-glass px-4 py-2 text-ink backdrop-blur hover:bg-glass-border">
        Sign in
      </Link>
    );
  }
  return (
    <Link
      to="/dashboard"
      aria-label={`${session.username}'s dashboard`}
      title={session.username}
      className="block h-9 w-9 overflow-hidden rounded-full border border-glass-border bg-glass backdrop-blur hover:border-ink"
    >
      {session.avatarUrl ? (
        <img src={session.avatarUrl} alt={`${session.username}'s Roblox avatar`} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <User className="h-4 w-4 text-ink" />
        </span>
      )}
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-hero min-h-screen font-sans text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <ShieldCheck className="h-6 w-6" /> AntiPoison
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
          <HeaderAvatar />
        </nav>
      </header>
      {children}
      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-soft">© 2026 AntiPoison. Not affiliated with Roblox Corporation.</footer>
    </div>
  );
}

export function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-glass-border bg-glass p-6 backdrop-blur-md ${className}`}>{children}</div>;
}
