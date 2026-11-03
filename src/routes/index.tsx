import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, Gauge, Ghost, Bot } from "lucide-react";
import { SiteShell, Glass } from "@/components/SiteShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AntiPoison — Roblox Anti-Cheat" },
      { name: "description", content: "AntiPoison detects fly hacks, speed hacks, noclip and auto farming in your Roblox games." },
      { property: "og:title", content: "AntiPoison — Roblox Anti-Cheat" },
      { property: "og:description", content: "Stop fly, speed, noclip and auto-farm cheaters in your Roblox games." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Bot, title: "Auto farming", text: "Our most important detection. Catches bots and macros grinding your economy." },
  { icon: Plane, title: "Fly hack", text: "Flags players floating or flying where they shouldn't." },
  { icon: Gauge, title: "Speed hack", text: "Spots movement faster than your game allows." },
  { icon: Ghost, title: "Noclip", text: "Detects players passing through walls and parts." },
];

function Index() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <p className="text-sm uppercase tracking-[0.3em] text-ink-soft">Roblox anti-cheat</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-tight md:text-7xl">Keep cheaters out of your game.</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">AntiPoison detects fly hacks, speed hacks, noclip and auto farming — so your players get a fair game.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/login" className="rounded-full bg-ink px-6 py-3 font-medium text-primary">Get started free</Link>
          <Link to="/pricing" className="rounded-full border border-glass-border bg-glass px-6 py-3 backdrop-blur">See pricing</Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-2">
        {features.map((f) => (
          <Glass key={f.title}>
            <f.icon className="h-7 w-7" />
            <h3 className="mt-4 font-display text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-ink-soft">{f.text}</p>
          </Glass>
        ))}
      </section>
    </SiteShell>
  );
}
