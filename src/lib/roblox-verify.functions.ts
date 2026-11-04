import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function rateLimited(action: string): Promise<boolean> {
  const ip =
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const db = await admin();
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await db
    .from("verify_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("action", action)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) return true;
  await db.from("verify_rate_limits").insert({ ip, action });
  return false;
}

function makeCode() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return "VERIFY-" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export const startVerification = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ username: z.string().trim().min(3).max(20).regex(/^[A-Za-z0-9_]+$/) }).parse(d))
  .handler(async ({ data }): Promise<Result<{ code: string; sessionToken: string; username: string; robloxId: number; expiresAt: string }>> => {
    if (await rateLimited("start")) return { ok: false, error: "Too many attempts. Wait a minute and try again." };
    let user: { id: number; name: string } | undefined;
    try {
      const res = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [data.username], excludeBannedUsers: true }),
      });
      if (!res.ok) return { ok: false, error: "Roblox is not responding. Try again shortly." };
      user = (await res.json()).data?.[0];
    } catch {
      return { ok: false, error: "Could not reach Roblox. Try again shortly." };
    }
    if (!user) return { ok: false, error: "Roblox user not found" };
    const code = makeCode();
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
    const db = await admin();
    const { error } = await db.from("verification_codes").insert({
      session_token: sessionToken, roblox_id: user.id, username: user.name, code, expires_at: expiresAt,
    });
    if (error) return { ok: false, error: "Could not create a code. Try again." };
    return { ok: true, code, sessionToken, username: user.name, robloxId: user.id, expiresAt };
  });

export const checkVerification = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ sessionToken: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<Result<{ username: string; robloxId: number; sessionToken: string }>> => {
    if (await rateLimited("check")) return { ok: false, error: "Too many attempts. Wait a minute and try again." };
    const db = await admin();
    const { data: row } = await db
      .from("verification_codes").select("*")
      .eq("session_token", data.sessionToken).eq("verified", false).maybeSingle();
    if (!row || new Date(row.expires_at).getTime() < Date.now() || !row.roblox_id)
      return { ok: false, error: "Code expired or not found. Generate a new one." };
    let description = "";
    try {
      const res = await fetch(`https://users.roblox.com/v1/users/${row.roblox_id}`);
      if (!res.ok) return { ok: false, error: "Roblox is not responding. Try again shortly." };
      description = (await res.json()).description ?? "";
    } catch {
      return { ok: false, error: "Could not reach Roblox. Try again shortly." };
    }
    if (!description.includes(row.code)) return { ok: false, error: "Code not found in your Roblox About section" };
    const { data: updated } = await db
      .from("verification_codes").update({ verified: true })
      .eq("session_token", data.sessionToken).eq("verified", false).select("session_token");
    if (!updated?.length) return { ok: false, error: "Code expired or not found. Generate a new one." };
    return { ok: true, username: row.username ?? "", robloxId: Number(row.roblox_id), sessionToken: data.sessionToken };
  });

export const getRobloxSession = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ sessionToken: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db
      .from("verification_codes").select("roblox_id, username")
      .eq("session_token", data.sessionToken).eq("verified", true).maybeSingle();
    return { robloxId: row?.roblox_id ? Number(row.roblox_id) : null, username: row?.username ?? null };
  });
