import { useEffect, useSyncExternalStore } from "react";
import { getRobloxSession } from "@/lib/roblox-verify.functions";

export type RobloxSession = {
  username: string;
  avatarUrl: string | null;
  avatarState: string | null;
};

export const ROBLOX_SESSION_KEY = "roblox_session";

let session: RobloxSession | null = null;
let status: "idle" | "loading" | "done" = "idle";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSession = () => session;
const getStatus = () => status;
const getServerSession = () => null;
const getServerStatus = () => "idle" as const;

export function setRobloxSession(s: RobloxSession) {
  session = s;
  status = "done";
  emit();
}

export function clearRobloxSession() {
  if (typeof window !== "undefined") localStorage.removeItem(ROBLOX_SESSION_KEY);
  session = null;
  status = "done";
  emit();
}

function ensureLoaded() {
  if (status !== "idle" || typeof window === "undefined") return;
  const token = localStorage.getItem(ROBLOX_SESSION_KEY);
  if (!token) {
    status = "done";
    return;
  }
  status = "loading";
  getRobloxSession({ data: { sessionToken: token } })
    .then((r) => {
      if (r.username) {
        session = { username: r.username, avatarUrl: r.avatarUrl, avatarState: r.avatarState };
      } else {
        localStorage.removeItem(ROBLOX_SESSION_KEY);
      }
    })
    .catch(() => {})
    .finally(() => {
      status = "done";
      emit();
    });
}

export function useRobloxSession() {
  const s = useSyncExternalStore(subscribe, getSession, getServerSession);
  const st = useSyncExternalStore(subscribe, getStatus, getServerStatus);
  useEffect(() => {
    ensureLoaded();
  }, []);
  return { session: s, loading: st !== "done" };
}
