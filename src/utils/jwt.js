// Denna fil hjälper oss att "läsa" JWT-token utan bibliotek.
// Ett JWT har formen "HEADER.PAYLOAD.SIGNATURE" (tre delar separerade med punkter).
// Vi vill bara se vad som finns i "PAYLOAD" (mitten-delen), där t.ex. userId och exp kan finnas.

// === Dekoda en base64url-sträng till ett JS-objekt ===
export function decodeJwt(token) {
  // Om inget token kom in – returnera null
  if (!token || typeof token !== "string") return null;

  try {
    // Dela upp token i tre delar: [header, payload, signature]
    const parts = token.split("."); // separera på punkter
    if (parts.length !== 3) return null; // ett "riktigt" JWT ska ha exakt 3 delar

    // PAYLOAD är index 1 (mitten)
    const payload = parts[1]; // ta ut mittenbiten

    // Base64URL -> Base64: ersätt tecken som används i URL-säkra strängar
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/"); // standardisera

    // atob konverterar Base64-text till vanlig text
    const json = atob(base64); // gör om från base64 till en JSON-sträng
    // KOLLA DENNA OM DET INTE FUNGERAR...

    // JSON.parse gör sträng -> objekt { userId: "...", username: "...", exp: 12345, ... }
    const obj = JSON.parse(json); // gör strängen till ett JS-objekt

    return obj; // returnera objektet
  } catch {
    // Vid minsta problem (felaktigt format etc.) returnerar vi null
    return null;
  }
}
