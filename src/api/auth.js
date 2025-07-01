// Denna funktion hämtar en CSRF-token från servern.
// Denna token behövs för att kunna skicka POST/PUT/DELETE-anrop till API:et.
// CSRF-token skyddar API:et från att någon annan hemsida försöker skicka skadliga förfrågningar.
// När man kallar på denna funktion, får man en cookie som heter "XSRF-TOKEN".

export async function getCsrfToken() {
  // Vi använder fetch för att göra ett HTTP-anrop till servern.
  // Vi använder PATCH-metoden, precis som API-dokumentationen säger.
  // PATCH är en HTTP-metod som betyder: "Gör en liten ändring" – i detta fall: generera en ny token.
  const res = await fetch("https://chatify-api.up.railway.app/csrf", {
    method: "PATCH", // "PATCH" betyder att vi begär en ändring – här används det för att skapa en CSRF-token.
    credentials: "include", // Detta gör att cookies (som CSRF-token) sparas i webbläsaren automatiskt.
  });

  // Efter att vi har fått ett svar från servern (res), så kollar vi om det gick bra.
  // Alla svar från servern har ett "statusvärde", t.ex. 200 (OK) eller 403 (förbjudet).
  // "res.ok" är en snabbkontroll: den är true om statusen är mellan 200–299 (lyckade svar).
  if (!res.ok) {
    // Om res.ok är false (t.ex. status 403, 500, 404...)
    // Då kastar vi ett felmeddelande så att vi vet att något gick fel när vi hämtade CSRF-token.
    throw new Error("Kunde inte hämta CSRF-token");
  }

  // Om res.ok var true, så gjorde vi inget fel – då är funktionen klar.
  // Vi behöver inte returnera något, eftersom cookien sätts automatiskt av webbläsaren.
}
