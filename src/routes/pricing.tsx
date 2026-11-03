import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { SiteShell, Glass } from "@/components/SiteShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AntiPoison" },
      { name: "description", content: "AntiPoison Free and Pro plans. Pro is 300 Robux per month with every detection and unlimited games." },
      { property: "og:title", content: "Pricing — AntiPoison" },
      { property: "og:description", content: "Free for 1 game, or Pro for 300 Robux/month." },
    ],
  }),
  component: Pricing,
});

const rows = ["Fly hack detection", "Speed hack detection", "Noclip detection", "Auto farming detection"];

function Plan({ name, price, games, included, highlight }: { name: string; price: string; games: string; included: boolean[]; highlight?: boolean }) {
  return (
    <Glass className={highlight ? "ring-2 ring-ink" : ""}>
      <h2 className="font-display text-2xl font-bold">{name}</h2>
      <p className="mt-2 font-display text-4xl font-bold">{price}</p>
      <p className="mt-1 text-ink-soft">{games}</p>
      <ul className="mt-6 space-y-3">
        {rows.map((r, i) => (
          <li key={r} className={`flex items-center gap-3 ${included[i] ? "" : "text-ink-soft line-through opacity-60"}`}>
            {included[i] ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />} {r}
          </li>
        ))}
      </ul>
      <Link to="/login" className={`mt-8 block rounded-full px-6 py-3 text-center font-medium ${highlight ? "bg-ink text-primary" : "border border-glass-border"}`}>
        {highlight ? "Go Pro" : "Start free"}
      </Link>
    </Glass>
  );
}

function Pricing() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-5xl font-bold">Simple pricing</h1>
        <p className="mt-4 text-ink-soft">Start free. Upgrade when your game grows.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Plan name="Free" price="0 Robux" games="1 game" included={[true, true, false, false]} />
          <Plan name="Pro" price="300 Robux / month" games="Unlimited games" included={[true, true, true, true]} highlight />
        </div>
      </section>
    </SiteShell>
  );
}
