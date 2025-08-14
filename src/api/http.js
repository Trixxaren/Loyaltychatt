// Denna fil skapar en "authFetch"-funktion som fungerar som fetch,
// men lägger till Authorization-headern automatiskt om vi har en token.
// Poängen: vi slipper glömma headern i varje anrop.

function getToken() {
  // Hämtar token vi sparade vid login (saveAuth lade den som 'auth_token')
  return localStorage.getItem("auth_token"); // kan vara null om ej inloggad
}

export async function authFetch(url, options = {}) {
  // options är valfria extra-inställningar, t.ex. method, headers, body
  const token = getToken(); // läs token varje gång (ifall den uppdateras)

  // Se till att headers-objektet finns
  const headers = new Headers(options.headers || {});

  // Om vi har token och den inte redan är satt, lägg in "Authorization: Bearer <token>"
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Slå ihop allt och anropa vanliga fetch
  const finalOptions = {
    // Standard: skicka cookies om backend vill (skadar inte)
    credentials: options.credentials ?? "include",
    ...options,
    headers, // våra uppdaterade headers med Authorization
  };

  // Kör anropet
  const res = await fetch(url, finalOptions);

  // Liten kvalitet: om 401 → ofta utloggad/ogiltig token
  if (res.status === 401) {
    // Här kan du t.ex. rensa storage och redirecta till /login om du vill
    // localStorage.removeItem('auth_token');
    // localStorage.removeItem('auth_user');
    // window.location.href = '/login';
  }

  return res; // returnera Response-objektet som vanligt
}
