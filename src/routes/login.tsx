import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, Glass } from "@/components/SiteShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AntiPoison" },
      { name: "description", content: "Sign in to AntiPoison with your Roblox account." },
      { property: "og:title", content: "Sign in — AntiPoison" },
      { property: "og:description", content: "Sign in with your Roblox account to manage your games." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-md px-6 py-20">
        <Glass className="w-full text-center">
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-ink-soft">Sign in with your Roblox account to open your dashboard.</p>
          {/* TODO: wire to Roblox OAuth once client ID/secret are provided */}
          <Link to="/dashboard" className="mt-8 block rounded-full bg-ink px-6 py-3 font-medium text-primary">
            Sign in with Roblox
          </Link>
        </Glass>
      </section>
    </SiteShell>
  );
}
