// Denna fil innehåller små hjälpfunktioner för att hantera cookies och localStorage.
// Varför? För att hålla koden ren och återanvändbar i hela appen.

// === Hämta en cookie med visst namn (t.ex. "XSRF-TOKEN") ===
export function getCookie(name) {
  // document.cookie är en enda lång sträng som innehåller alla cookies
  const value = `; ${document.cookie}`; // lägg till ett '; ' först så blir split enklare
  const parts = value.split(`; ${name}=`); // dela upp strängen vid "; NAMN="
  if (parts.length === 2) {
    // om vi hittade exakt en matchning
    return parts.pop().split(";").shift(); // ta sista delen, dela på ';' och ta första = själva cookie-värdet
  }
  return undefined; // om inte hittad, returnera undefined
}

// === Spara auth-data i localStorage ===
export function saveAuth({ token, user }) {
  // Vi vill spara token och användarinfo i webbläsaren så man förblir inloggad vid reload.
  // localStorage lagrar strängar – därför använder vi JSON.stringify.
  localStorage.setItem("auth_token", token); // spara själva JWT-strängen
  localStorage.setItem("auth_user", JSON.stringify(user)); // spara användarobjekt som text
}

// === Hämta auth-data från localStorage ===
export function getAuth() {
  // Plocka ut token och användare (kan vara null om inget sparat)
  const token = localStorage.getItem("auth_token"); // hämta token
  const userRaw = localStorage.getItem("auth_user"); // hämta användarsträngen
  const user = userRaw ? JSON.parse(userRaw) : null; // gör om strängen till objekt om det finns
  return { token, user }; // returnera båda
}

// === Rensa auth-data (vid logout) ===
export function clearAuth() {
  // Ta bort både token och användarinfo – detta gör användaren "utloggad"
  localStorage.removeItem("auth_token"); // ta bort token
  localStorage.removeItem("auth_user"); // ta bort user
}
