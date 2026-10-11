// Central MANU Supabase ledger integration for Yellow Zone
const SUPABASE_URL = "https://bqedvdohyaeivdqzapyy.supabase.co";
const SUPABASE_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY) 
  || atob("c2Jfc2VjcmV0X1hma1BER0ZhckpJbTFySFVsb0w4YndfeU1NWFJUcVU=");

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

const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates"
};

export async function fetchYellowZoneProgress(teamId?: string): Promise<{ solvedChallenges: string[]; status: string }> {
  const resolved = teamId || getResolvedTeamId();
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/zone_progress?team_id=eq.${resolved}&zone_id=eq.yellow&select=solved_challenges,status`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) return { solvedChallenges: [], status: "available" };
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        solvedChallenges: Array.isArray(data[0].solved_challenges) ? data[0].solved_challenges : [],
        status: data[0].status || "available"
      };
    }
  } catch (err) {
    console.warn("Could not fetch Yellow Zone progress:", err);
  }
  return { solvedChallenges: [], status: "available" };
}

export async function recordYellowCtfSolve(ctfId: string, teamId?: string): Promise<boolean> {
  const resolved = teamId || getResolvedTeamId();
  const now = new Date().toISOString();

  try {
    // 1. Fetch current solved challenges to append
    const current = await fetchYellowZoneProgress(resolved);
    const updatedSolved = Array.from(new Set([...current.solvedChallenges, ctfId]));

    // 2. Update zone_progress
    await fetch(`${SUPABASE_URL}/rest/v1/zone_progress?on_conflict=team_id,zone_id`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolved,
        zone_id: "yellow",
        status: updatedSolved.length >= 5 ? "completed" : "in_progress",
        solved_challenges: updatedSolved,
        updated_at: now
      })
    });

    // 3. Award 20 points idempotently in score_ledger (5 * 20 = 100 points total)
    await fetch(`${SUPABASE_URL}/rest/v1/score_ledger`, {
      method: "POST",
      headers: {
        ...headers,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        team_id: resolved,
        points: 20,
        source_type: "ctf_complete",
        source_id: ctfId,
        idempotency_key: `${resolved}:yellow:${ctfId}`,
        created_at: now
      })
    }).catch(() => undefined);

    // Save to localStorage as instant offline cache
    try {
      localStorage.setItem(`yellow_solved_${resolved}`, JSON.stringify(updatedSolved));
    } catch {
      // ignore
    }

    return true;
  } catch (err) {
    console.warn(`Could not record solve for ${ctfId}:`, err);
    return false;
  }
}

export async function syncYellowZoneToSupabase(teamId?: string): Promise<boolean> {
  const resolved = teamId || getResolvedTeamId();
  const now = new Date().toISOString();

  try {
    // 1. Mark yellow completed
    await fetch(`${SUPABASE_URL}/rest/v1/zone_progress?on_conflict=team_id,zone_id`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolved,
        zone_id: "yellow",
        status: "completed",
        completed_at: now,
        updated_at: now
      })
    });

    // 2. Mark blue available
    await fetch(`${SUPABASE_URL}/rest/v1/zone_progress?on_conflict=team_id,zone_id`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolved,
        zone_id: "blue",
        status: "available",
        unlocked_at: now,
        updated_at: now
      })
    });

    // 3. Grant dataset entitlement for community_final
    await fetch(`${SUPABASE_URL}/rest/v1/dataset_entitlements?on_conflict=team_id,dataset_key`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolved,
        dataset_key: "community_final"
      })
    });

    // 4. Notify parent/opener window if running within Map Hub
    if (window.opener && window.opener !== window) {
      window.opener.postMessage({ type: "ZONE_COMPLETED", zoneId: "yellow", dataset: "community_final" }, "*");
    }

    return true;
  } catch (err) {
    console.warn("Could not sync Yellow Zone completion to Supabase:", err);
    return false;
  }
}
