import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteShell, Glass } from "@/components/SiteShell";
import { startVerification, checkVerification, getRobloxSession } from "@/lib/roblox-verify.functions";
import { setRobloxSession, clearRobloxSession } from "@/lib/roblox-session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AntiPoison" },
      { name: "description", content: "Verify your Roblox account to sign in to AntiPoison." },
      { property: "og:title", content: "Sign in — AntiPoison" },
      { property: "og:description", content: "Verify your Roblox account to manage your games." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const KEY = "roblox_session";

type SignedIn = { username: string; avatarUrl: string | null; avatarState: string | null };

function Avatar({ url, state, username }: { url: string | null; state: string | null; username: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const show = url && state !== "Pending" && !failed;
  return show ? (
    <img src={url} alt={`${username}'s Roblox avatar`} onError={() => setFailed(true)}
      className="h-32 w-32 shrink-0 rounded-full border border-glass-border bg-glass object-cover" />
  ) : (
    <div aria-label="Loading avatar" className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-glass-border bg-glass">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
    </div>
  );
}

function Login() {
  const start = useServerFn(startVerification);
  const check = useServerFn(checkVerification);
  const me = useServerFn(getRobloxSession);

  const [username, setUsername] = useState("");
  const [pending, setPending] = useState<{ code: string; sessionToken: string; username: string; robloxId: number } | null>(null);
  const [signedIn, setSignedIn] = useState<SignedIn | null>(null);
  const [loading, setLoading] = useState<"start" | "check" | "me" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(KEY);
    if (!token) return;
    setLoading("me");
    me({ data: { sessionToken: token } })
      .then((r) => (r.username ? setSignedIn({ username: r.username, avatarUrl: r.avatarUrl, avatarState: r.avatarState }) : localStorage.removeItem(KEY)))
      .catch(() => {})
      .finally(() => setLoading(null));
  }, [me]);

  // Retry once after 3s if the avatar render isn't ready yet.
  const needsRetry = !!signedIn && (!signedIn.avatarUrl || signedIn.avatarState === "Pending");
  useEffect(() => {
    if (!needsRetry) return;
    const token = localStorage.getItem(KEY);
    if (!token) return;
    const t = setTimeout(() => {
      me({ data: { sessionToken: token } })
        .then((r) => r.username && setSignedIn({ username: r.username, avatarUrl: r.avatarUrl, avatarState: r.avatarState }))
        .catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsRetry]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username.trim())) return setError("Enter a valid Roblox username.");
    setLoading("start");
    try {
      const r = await start({ data: { username: username.trim() } });
      if (r.ok) setPending(r);
      else setError(r.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  }

  async function onVerify() {
    if (!pending) return;
    setError(null);
    setLoading("check");
    try {
      const r = await check({ data: { sessionToken: pending.sessionToken } });
      if (r.ok) {
        localStorage.setItem(KEY, r.sessionToken);
        setSignedIn({ username: r.username, avatarUrl: r.avatarUrl, avatarState: r.avatarState });
        setPending(null);
      } else setError(r.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  }

  function signOut() {
    localStorage.removeItem(KEY);
    setSignedIn(null);
    setPending(null);
    setUsername("");
  }

  return (
    <SiteShell>
      <section className="mx-auto flex max-w-md px-6 py-20">
        <Glass className="w-full text-center">
          {loading === "me" ? (
            <p className="text-ink-soft">Checking your session…</p>
          ) : signedIn ? (
            <>
              <div className="flex items-center justify-center gap-5 text-left">
                <Avatar url={signedIn.avatarUrl} state={signedIn.avatarState} username={signedIn.username} />
                <h1 className="font-display text-2xl font-bold">Signed in as {signedIn.username}</h1>
              </div>
              <Link to="/dashboard" className="mt-8 block rounded-full bg-ink px-6 py-3 font-medium text-primary">
                Go to dashboard
              </Link>
              <button onClick={signOut} className="mt-3 w-full rounded-full border border-ink/20 px-6 py-3 font-medium">
                Sign out
              </button>
            </>
          ) : !pending ? (
            <>
              <h1 className="font-display text-3xl font-bold">Welcome back</h1>
              <p className="mt-2 text-ink-soft">Enter your Roblox username to verify your account.</p>
              <form onSubmit={onGenerate} className="mt-8 space-y-3">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Roblox username"
                  aria-label="Roblox username"
                  className="w-full rounded-full border border-ink/20 bg-background/60 px-5 py-3 text-ink outline-none focus:border-ink"
                />
                <button disabled={loading === "start"} className="w-full rounded-full bg-ink px-6 py-3 font-medium text-primary disabled:opacity-60">
                  {loading === "start" ? "Generating…" : "Generate code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Verify {pending.username}</h1>
              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-ink/30 bg-background/70 px-5 py-4">
                <code className="font-mono text-lg font-bold tracking-wider">{pending.code}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pending.code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-primary"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 text-sm text-ink-soft">
                Paste this code into the About section of your Roblox profile, save it, wait a few seconds, then click Verify.
              </p>
              <a
                href={`https://www.roblox.com/users/${pending.robloxId}/profile`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm underline"
              >
                Open my Roblox profile
              </a>
              <button
                onClick={onVerify}
                disabled={loading === "check"}
                className="mt-6 w-full rounded-full bg-ink px-6 py-3 font-medium text-primary disabled:opacity-60"
              >
                {loading === "check" ? "Verifying…" : "Verify"}
              </button>
              <button onClick={() => { setPending(null); setError(null); }} className="mt-3 text-sm text-ink-soft underline">
                Use a different username
              </button>
            </>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        </Glass>
      </section>
    </SiteShell>
  );
}
