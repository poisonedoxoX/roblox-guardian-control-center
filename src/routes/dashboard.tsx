import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteShell, Glass } from "@/components/SiteShell";
import { getRobloxSession } from "@/lib/roblox-verify.functions";
import { clearRobloxSession, setRobloxSession } from "@/lib/roblox-session";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AntiPoison" },
      { name: "description", content: "Your AntiPoison dashboard." },
      { property: "og:title", content: "Dashboard — AntiPoison" },
      { property: "og:description", content: "Manage your AntiPoison games." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const KEY = "roblox_session";

type Me = { username: string; avatarUrl: string | null; avatarState: string | null };

function Avatar({ url, state, username }: { url: string | null; state: string | null; username: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);

  if (url && state !== "Pending" && !failed) {
    return (
      <img
        src={url}
        alt={`${username}'s Roblox avatar`}
        onError={() => setFailed(true)}
        className="h-20 w-20 shrink-0 rounded-full border border-glass-border bg-glass object-cover"
      />
    );
  }
  return (
    <div
      aria-label="Avatar"
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-glass-border bg-glass font-display text-2xl font-bold"
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

function Dashboard() {
  const getSession = useServerFn(getRobloxSession);
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const token = localStorage.getItem(KEY);
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    let cancelled = false;

    // The server decides whether this token is a verified session.
    // localStorage is only used to send the token, never as proof of login.
    getSession({ data: { sessionToken: token } })
      .then((r) => {
        if (cancelled) return;
        if (!r.username) {
          clearRobloxSession();
          navigate({ to: "/login" });
          return;
        }
        const s = { username: r.username, avatarUrl: r.avatarUrl, avatarState: r.avatarState };
        setMe(s);
        setRobloxSession(s);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) navigate({ to: "/login" });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSession]);

  function signOut() {
    clearRobloxSession();
    navigate({ to: "/" });
  }

  if (status === "loading" || !me) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <Glass className="py-20 text-center text-ink-soft">Loading your dashboard…</Glass>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <Glass className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Avatar url={me.avatarUrl} state={me.avatarState} username={me.username} />
            <div>
              <p className="text-sm text-ink-soft">Signed in as</p>
              <h1 className="font-display text-3xl font-bold">{me.username}</h1>
            </div>
          </div>
          <button
            onClick={signOut}
            className="rounded-full border border-ink/20 px-6 py-3 font-medium text-ink hover:bg-glass-border"
          >
            Sign out
          </button>
        </Glass>

        <div className="grid gap-6 md:grid-cols-2">
          <Glass>
            <h2 className="font-display text-xl font-bold">Your games</h2>
            <p className="mt-2 text-ink-soft">Your protected games will appear here.</p>
          </Glass>
          <Glass>
            <h2 className="font-display text-xl font-bold">Account</h2>
            <p className="mt-2 text-ink-soft">
              Verified Roblox account. Need to switch? <Link to="/login" className="underline">Sign in with another account</Link>.
            </p>
          </Glass>
        </div>
      </section>
    </SiteShell>
  );
}
