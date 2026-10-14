// Central Hub API integration for Yellow Zone (Server-authoritative, zero exposed DB secrets)
const CENTRAL_HUB_URL = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CENTRAL_HUB_URL)
  || "https://last-dataset.vercel.app";
const SERVICE_TOKEN = "the-last-dataset-2026-production-service-token-manipal";

export function getResolvedTeamId(): string {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("team");
    if (param) {
      const clean = param.trim().toUpperCase();
      sessionStorage.setItem("manu_team_id", clean);
      localStorage.setItem("manu_team_id", clean);
      return clean;
    }
    const session = sessionStorage.getItem("manu_team_id") || sessionStorage.getItem("manu-team-id");
    if (session) return session.trim().toUpperCase();
    const local = localStorage.getItem("manu_team_id") || localStorage.getItem("manu-team-id");
    if (local) return local.trim().toUpperCase();
  } catch {
    // browser sandbox
  }
  return "TECHTEAM10328";
}

export function getBlueZoneTransitionUrl(): string {
  const teamId = getResolvedTeamId();
  return `https://yellow-to-blue-slideshow.vercel.app/?team=${encodeURIComponent(teamId)}`;
}

export async function fetchYellowZoneProgress(teamId?: string): Promise<{ isCompleted: boolean; solvedChallenges: string[]; status: string }> {
  const resolved = teamId || getResolvedTeamId();
  try {
    const res = await fetch(`${CENTRAL_HUB_URL}/api/integrations/team-state?teamId=${encodeURIComponent(resolved)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!res.ok) return { isCompleted: false, solvedChallenges: [], status: "available" };
    const data = await res.json();
    if (data && data.bootstrap) {
      const solved = Array.isArray(data.bootstrap.solvedChallenges) ? data.bootstrap.solvedChallenges : [];
      const zones = Array.isArray(data.bootstrap.zones) ? data.bootstrap.zones : Object.values(data.bootstrap.zones || {});
      const yellowZone = zones.find((z: any) => z.id === "yellow") || (data.bootstrap.zones && data.bootstrap.zones.yellow);
      const status = yellowZone?.status || yellowZone?.state || "available";
      const isCompleted = status === "completed" || status === "cleared" || solved.includes("yellow-01");
      return {
        isCompleted,
        solvedChallenges: solved,
        status
      };
    }
  } catch (err) {
    console.warn("Could not fetch Yellow Zone progress:", err);
  }
  return { isCompleted: false, solvedChallenges: [], status: "available" };
}

export async function recordYellowCtfSolve(ctfId: string = "yellow-01", teamId?: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const resolved = teamId || getResolvedTeamId();

  try {
    // 1. Authoritative Server-side RPC integration / Central Hub completion
    const res = await fetch(`${CENTRAL_HUB_URL}/api/integrations/zone-ctf-complete`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ teamId: resolved, ctfId: "yellow-01", zoneId: "yellow" })
    });

    // 2. Also ensure yellow zone completion endpoint is notified
    const res2 = await fetch(`${CENTRAL_HUB_URL}/api/yellow/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ teamId: resolved })
    }).catch(() => null);

    const isOk = res.ok || (res2 && res2.ok);
    const data = res.ok ? await res.json().catch(() => ({})) : (res2 && res2.ok ? await res2.json().catch(() => ({})) : null);

    if (isOk) {
      // Save to localStorage as instant offline cache
      try {
        localStorage.setItem(`yellow_solved_${resolved}`, JSON.stringify([ctfId, "yellow-01"]));
        localStorage.setItem("manu-yellow-investigation-solved-v1", "true");
        localStorage.setItem("manu_solved", "true");
      } catch {
        // ignore
      }

      // Notify parent/opener window if running within Map Hub
      if (typeof window !== "undefined") {
        try {
          if (window.opener && window.opener !== window) {
            window.opener.postMessage({ type: "ZONE_COMPLETED", zoneId: "yellow", dataset: "community_final" }, "*");
          }
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "ZONE_COMPLETED", zoneId: "yellow", dataset: "community_final" }, "*");
          }
        } catch {}
      }

      const confirmedScore = data?.score || data?.bootstrap?.score?.total || 300;
      return { success: true, score: confirmedScore };
    }

    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.message || errData.error || `HTTP ${res.status}` };
  } catch (err: any) {
    console.warn(`Could not record solve for ${ctfId}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function syncYellowZoneToSupabase(teamId?: string): Promise<{ success: boolean; score?: number; error?: string }> {
  return recordYellowCtfSolve("yellow-01", teamId);
}
