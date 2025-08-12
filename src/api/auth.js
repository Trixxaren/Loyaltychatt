// Den här filen innehåller funktioner som pratar med Chatify-API:t.
// Vi gör små, tydliga funktioner som du kan återanvända i dina komponenter.

// ===== 1) Hämta CSRF-token från API =====
export async function getCsrfToken() {
  // Vi använder fetch för att anropa servern.
  // Enligt Swagger ska vi PATCH:a /csrf för att få en csrfToken tillbaka.
  const res = await fetch("https://chatify-api.up.railway.app/csrf", {
    method: "PATCH", // PATCH = "gör en liten ändring" (här: generera/uppdatera en CSRF-token)
    credentials: "include", // Skicka med cookies om servern vill använda dem internt (skadar inte här)
  });

  // res.ok är true om svaret har statuskod 200–299 (dvs lyckat).
  if (!res.ok) {
    // Om status inte är lyckad, kastar vi ett Error så att komponenten kan fånga det och visa fel.
    throw new Error("Kunde inte hämta CSRF-token");
  }

  // Vi förväntar oss JSON tillbaka, t.ex. { "csrfToken": "uuid-här" } enligt Swagger-bilden.
  const data = await res.json(); // Gör om svaret från text -> JS-objekt
  return data.csrfToken; // Returnera bara själva token-strängen (enkelt att använda)
}

// ===== 2) Logga in och få JWT-token =====
export async function loginUser({ username, password, csrfToken }) {
  // Denna funktion skickar inloggningsuppgifter + csrfToken i BODY (inte i headers).
  // Precis så som Swagger-exemplet visar.

  const res = await fetch("https://chatify-api.up.railway.app/auth/token", {
    method: "POST", // POST = "skapa/utför" en login-operation på servern
    headers: {
      "Content-Type": "application/json", // Vi talar om att vi skickar JSON i body
    },
    credentials: "include", // Låt cookies flöda om servern vill använda dem (safe)
    body: JSON.stringify({
      // Gör om vårt JS-objekt till en JSON-sträng (krav för body)
      username, // Användarnamnet användaren skrev in i formuläret
      password, // Lösenordet från formuläret
      csrfToken, // Viktigt: CSRF-token som vi nyss hämtade från /csrf
    }),
  });

  // Försök läsa svaret som JSON (kan innehålla { token: "...", message: "..." })
  const data = await res.json().catch(() => ({})); // Fallback till tomt obj om ingen JSON

  // Om status inte är 2xx vill vi kasta ett fel med bra meddelande till användaren.
  if (!res.ok) {
    // API:t skickar ofta "Invalid credentials" vid fel – visa det om det finns.
    throw new Error(data?.message || "Inloggning misslyckades");
  }

  // Om allt gick bra returnerar vi svaret (borde innehålla t.ex. { token: "JWT..." }).
  return data;
}
