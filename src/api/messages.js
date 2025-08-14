// src/api/messages.js

// 1) Vår fetch-wrapper som alltid sätter Authorization-headern om token finns
import { authFetch } from "./http";

/**
 * Liten hjälpare: gör text säker för HTML (XSS-skydd på klientsidan).
 * Backend bör också sanera, men detta är ett extra lager.
 */
export function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Hämta en färsk CSRF-token från API:t.
 * Vi kör via Vite-proxyn (/api/csrf) så cookies/CSRF kopplas till samma origin (localhost).
 */
async function getCsrf() {
  const res = await authFetch("/api/csrf", { method: "PATCH" });
  if (!res.ok) throw new Error("Kunde inte hämta CSRF-token");
  const data = await res.json();
  return data.csrfToken; // sträng (UUID)
}

/**
 * Hämta meddelanden.
 * Vissa backends kräver bara JWT för GET, andra kräver även CSRF.
 * Vi skickar med CSRF i header för att vara kompatibla med strängare lägen.
 */
export async function getMessages({ conversationId } = {}) {
  const url = conversationId
    ? `/api/messages?conversationId=${encodeURIComponent(conversationId)}`
    : "/api/messages";

  // Hämta CSRF (om backend inte kräver det för GET kan detta tas bort).
  const csrfToken = await getCsrf();

  const res = await authFetch(url, {
    method: "GET",
    headers: {
      "X-CSRF-Token": csrfToken, // säkra sidan: skicka CSRF även vid GET
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Kunde inte hämta meddelanden (status ${res.status}) ${text}`
    );
  }
  return res.json(); // förväntas vara en lista av meddelanden
}

/**
 * Skapa ett nytt meddelande.
 * OBS: API:t vill ha fältet "text" (inte "content").
 */
export async function createMessage({ content, conversationId }) {
  // Sanera texten innan vi skickar den
  const safeText = escapeHTML(content);

  // Bygg body enligt API:et
  const body = { text: safeText };
  if (conversationId) body.conversationId = conversationId;

  // Hämta CSRF för state-ändrande anrop
  const csrfToken = await getCsrf();

  const res = await authFetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Kunde inte skapa meddelande (status ${res.status}) ${text}`
    );
  }
  return res.json(); // bör vara det skapade meddelandet
}

/**
 * Radera ett meddelande (endast egna bör tillåtas av backend).
 */
export async function deleteMessage(messageId) {
  const csrfToken = await getCsrf();

  const res = await authFetch(
    `/api/messages/${encodeURIComponent(messageId)}`,
    {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Kunde inte radera meddelande (status ${res.status}) ${text}`
    );
  }
  return true; // DELETE svarar ofta 204 No Content
}
