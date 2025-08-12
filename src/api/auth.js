// Denna funktion hämtar en CSRF-token från servern.
// Denna token behövs för att kunna skicka POST/PUT/DELETE-anrop till API:et.
// CSRF-token skyddar API:et från att någon annan hemsida försöker skicka skadliga förfrågningar.
// När man kallar på denna funktion, får man en cookie som heter "XSRF-TOKEN".

export async function getCsrfToken() {
  // Vi använder fetch för att göra ett HTTP-anrop till servern.
  const res = await fetch("https://chatify-api.up.railway.app/csrf", {
    method: "PATCH", // "PATCH" betyder att vi begär en ändring, här används det för att skapa en CSRF-token.
    credentials: "include", // Detta gör att cookies (som CSRF-token) sparas i webbläsaren (cookies) automatiskt och skickas med.
  });

  // Efter att vi har fått ett svar från servern (res), så kollar vi om det gick bra.
  // Om svaret inte är lyckat (t.ex. 403, 500), så kastar vi ett fel
  if (!res.ok) {
    throw new Error("Kunde inte hämta CSRF-token"); // Ett enkelt felmeddelande som du kan fånga
  }

  // Om det gick bra behöver vi inte returnera något, webbläsaren sparar cookien automatiskt
}

// === Logga in och få JWT ===
export async function loginUser({ username, password, csrfToken }) {
  // Denna funktion skickar användarnamn + lösenord till API:et för att få ett JWT (inloggnings-token).
  // Vi kräver att en CSRF-token skickas in (som vi hämtade via getCsrfToken + getCookie).

  // Skicka POST till /auth/token med credentials
  const res = await fetch("https://chatify-api.up.railway.app/auth/token", {
    method: "POST", // POST = vi skickar data för att "skapa" en login-session/token
    headers: {
      "Content-Type": "application/json", // Talar om att vi skickar JSON-data
      "X-CSRF-Token": csrfToken, // Mycket viktigt! Annars får vi 403 (förbjudet)
    },
    credentials: "include", // Se till att cookies används (bra vana när CSRF är inblandat)
    body: JSON.stringify({
      // Gör om JS-objekt till en JSON-sträng
      username, // Användarnamn från formuläret
      password, // Lösenord från formuläret
    }),
  });

  // Läs ut svaret som JSON så vi kan titta på det
  const data = await res.json().catch(() => ({})); // .catch för att undvika krasch om tomt svar

  // Om status inte är 2xx så kastar vi ett fel med meddelandet från API:et (t.ex. "Invalid credentials")
  if (!res.ok) {
    // Om API:et skickar ett meddelande så använd det, annars fallback
    const message = data?.message || "Inloggning misslyckades";
    throw new Error(message);
  }

  // Om allt gick bra returnerar vi svaret (borde innehålla JWT-token och ev. annan info)
  return data; // ex: { token: "eyJhbGciOi...", ... }
}
