import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteShell, Glass } from "@/components/SiteShell";
import { startVerification, checkVerification, getRobloxSession } from "@/lib/roblox-verify.functions";

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

function Login() {
  const start = useServerFn(startVerification);
  const check = useServerFn(checkVerification);
  const me = useServerFn(getRobloxSession);

  const [username, setUsername] = useState("");
  const [pending, setPending] = useState<{ code: string; sessionToken: string; username: string; robloxId: number } | null>(null);
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [loading, setLoading] = useState<"start" | "check" | "me" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(KEY);
    if (!token) return;
    setLoading("me");
    me({ data: { sessionToken: token } })
      .then((r) => (r.username ? setSignedIn(r.username) : localStorage.removeItem(KEY)))
      .catch(() => {})
      .finally(() => setLoading(null));
  }, [me]);

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
        setSignedIn(r.username);
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
              <h1 className="font-display text-3xl font-bold">Signed in as {signedIn}</h1>
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
