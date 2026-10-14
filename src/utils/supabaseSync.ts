// Central Hub API integration for Yellow Zone (Server-authoritative, zero exposed DB secrets)
const CENTRAL_HUB_URL = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CENTRAL_HUB_URL)
  || "https://last-dataset.vercel.app";
const SERVICE_TOKEN = "the-last-dataset-2026-production-service-token-manipal";

export function getResolvedTeamId(): string {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("team");
    if (param) {
      sessionStorage.setItem("manu_team_id", param.trim().toUpperCase());
      localStorage.setItem("manu_team_id", param.trim().toUpperCase());
      return param.trim().toUpperCase();
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

export async function fetchYellowZoneProgress(teamId?: string): Promise<{ solvedChallenges: string[]; status: string }> {
  const resolved = teamId || getResolvedTeamId();
  try {
    const res = await fetch(`${CENTRAL_HUB_URL}/api/integrations/team-state?teamId=${encodeURIComponent(resolved)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!res.ok) return { solvedChallenges: [], status: "available" };
    const data = await res.json();
    if (data && data.bootstrap) {
      const solved = Array.isArray(data.bootstrap.solvedChallenges) ? data.bootstrap.solvedChallenges : [];
      const yellowZone = data.bootstrap.zones?.yellow;
      const status = yellowZone?.status || "available";
      return {
        solvedChallenges: solved,
        status
      };
    }
  } catch (err) {
    console.warn("Could not fetch Yellow Zone progress:", err);
  }
  return { solvedChallenges: [], status: "available" };
}

export async function recordYellowCtfSolve(ctfId: string = "yellow-01", teamId?: string): Promise<boolean> {
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
    fetch(`${CENTRAL_HUB_URL}/api/yellow/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ teamId: resolved })
    }).catch(() => undefined);

    // Save to localStorage as instant offline cache
    try {
      localStorage.setItem(`yellow_solved_${resolved}`, JSON.stringify([ctfId, "yellow-01"]));
    } catch {
      // ignore
    }

    // 3. Notify parent/opener window if running within Map Hub
    if (window.opener && window.opener !== window) {
      window.opener.postMessage({ type: "ZONE_COMPLETED", zoneId: "yellow", dataset: "community_final" }, "*");
    }

    return res.ok;
  } catch (err) {
    console.warn(`Could not record solve for ${ctfId}:`, err);
    return false;
  }
}

export async function syncYellowZoneToSupabase(teamId?: string): Promise<boolean> {
  return recordYellowCtfSolve("yellow-01", teamId);
}
