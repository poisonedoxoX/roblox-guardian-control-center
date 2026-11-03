import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Glass } from "@/components/SiteShell";

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

function Dashboard() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-4xl font-bold">Dashboard</h1>
        <Glass className="mt-8 py-20 text-center text-ink-soft">Your dashboard is coming soon.</Glass>
      </section>
    </SiteShell>
  );
}
