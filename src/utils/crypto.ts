export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyFlag(ctfId: string, input: string, expectedHash: string): Promise<boolean> {
  const normalized = input.trim().toUpperCase();
  const hash = await sha256(`yellowzone:${ctfId}:${normalized}`);
  return hash.toLowerCase() === expectedHash.toLowerCase();
}
