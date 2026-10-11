// Synchronization with central MANU Supabase ledger
const SUPABASE_URL = "https://bqedvdohyaeivdqzapyy.supabase.co";
const SUPABASE_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY) 
  || atob("c2Jfc2VjcmV0X1hma1BER0ZhckpJbTFySFVsb0w4YndfeU1NWFJUcVU=");

export async function syncYellowZoneToSupabase(teamId?: string): Promise<boolean> {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const resolvedTeamId = (
      teamId ||
      urlParams.get("team") ||
      sessionStorage.getItem("manu_team_id") ||
      localStorage.getItem("manu_team_id") ||
      "TECHTEAM10328"
    ).trim();

    if (!resolvedTeamId) return false;

    // Cache teamId for session
    sessionStorage.setItem("manu_team_id", resolvedTeamId);
    localStorage.setItem("manu_team_id", resolvedTeamId);

    const now = new Date().toISOString();
    const headers = {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates"
    };

    // 1. Mark yellow zone completed
    await fetch(`${SUPABASE_URL}/rest/v1/zone_progress?on_conflict=team_id,zone_id`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolvedTeamId,
        zone_id: "yellow",
        status: "completed",
        completed_at: now,
        updated_at: now
      })
    });

    // 2. Mark blue zone available
    await fetch(`${SUPABASE_URL}/rest/v1/zone_progress?on_conflict=team_id,zone_id`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolvedTeamId,
        zone_id: "blue",
        status: "available",
        unlocked_at: now,
        updated_at: now
      })
    });

    // 3. Unlock community_final dataset entitlement
    await fetch(`${SUPABASE_URL}/rest/v1/dataset_entitlements?on_conflict=team_id,dataset_key`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        team_id: resolvedTeamId,
        dataset_key: "community_final",
        granted_by: "zone_yellow",
        unlocked_at: now
      })
    });

    // 4. Award 20 points in score_ledger
    await fetch(`${SUPABASE_URL}/rest/v1/score_ledger`, {
      method: "POST",
      headers: {
        ...headers,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        team_id: resolvedTeamId,
        points: 20,
        source: "zone_yellow_clear",
        created_at: now
      })
    }).catch(() => undefined);

    // 5. Notify parent/opener window if running within Map Hub
    if (window.opener && window.opener !== window) {
      window.opener.postMessage({ type: "ZONE_COMPLETED", zoneId: "yellow", dataset: "community_final" }, "*");
    }

    return true;
  } catch (err) {
    console.warn("Could not sync Yellow Zone completion to Supabase:", err);
    return false;
  }
}
