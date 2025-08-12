// Vi importerar React-hooks för att hantera state (formdata, fel, loading) och navigering.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Vi importerar våra API-funktioner vi just gjorde.
import { getCsrfToken, loginUser } from "../api/auth";

// Hjälpare för att spara/hämta auth-info (token + user) i localStorage.
import { saveAuth, getAuth } from "../utils/token";

// Enkel JWT-dekodare för att plocka ut fält ur token (t.ex. userId, username, avatar).
import { decodeJwt } from "../utils/jwt";

export default function Login() {
  // form = håller värdena från inputfälten (användarnamn + lösenord)
  const [form, setForm] = useState({
    username: "", // texten som skrivs i användarnamn-fältet
    password: "", // texten som skrivs i lösenords-fältet
  });

  // error = sträng för felmeddelanden (visas under knappen t.ex.)
  const [error, setError] = useState("");

  // loading = true när vi väntar på servern (hindrar dubbelklick + visar "Loggar in...")
  const [loading, setLoading] = useState(false);

  // navigate = funktion för att byta sida (t.ex. till /chat efter lyckad login)
  const navigate = useNavigate();

  // useEffect körs när komponenten laddas. Här kollar vi om vi redan har en token sparad.
  useEffect(() => {
    const { token } = getAuth(); // Läs från localStorage om det finns en auth_token sedan innan
    if (token) {
      // Om token redan finns betyder det att användaren är "inloggad" – skicka till /chat direkt.
      navigate("/chat", { replace: true }); // replace = byt sida utan att lägga till i historiken
    }
  }, [navigate]); // Lägg navigate som dependency (good practice)

  // Denna funktion körs varje gång användaren skriver i ett inputfält.
  const handleChange = (e) => {
    // e.target.name är "username" eller "password"
    // e.target.value är det nya värdet i fältet
    setForm((prev) => ({
      ...prev, // kopiera gamla värden
      [e.target.name]: e.target.value, // ersätt bara det fält som ändrades
    }));
  };

  // Denna funktion körs när man klickar på "Logga in"-knappen (submit på formuläret).
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stoppa webbläsarens default (som är att ladda om sidan)
    setError(""); // Rensa gamla felmeddelanden
    setLoading(true); // Visa att vi jobbar (disable knapp etc.)

    try {
      // 1) Hämta CSRF-token från servern (enligt Swagger ska den skickas i BODY sen)
      const csrfToken = await getCsrfToken(); // returvärdet är en sträng, t.ex. "d412e5c1-...."

      // 2) Anropa login med username + password + CSRF-token i body
      const data = await loginUser({
        username: form.username, // värdet från inputfältet
        password: form.password, // värdet från inputfältet
        csrfToken, // token vi precis hämtade
      });

      // 3) API:t borde skicka tillbaka ett JWT-token (dvs en lång textsträng)
      const token = data?.token; // plocka ut token från svaret

      // Om token saknas kan vi inte gå vidare – kasta ett begripligt fel.
      if (!token) {
        throw new Error("Token saknas i svaret från servern");
      }

      // 4) Dekoda JWT för att få ut användarinfo (fältens namn kan variera mellan API:n)
      const payload = decodeJwt(token); // t.ex. { userId: "...", username: "...", avatar: "...", exp: 12345 }

      // 5) Bygg ett user-objekt som vi sparar i localStorage tillsammans med token.
      const user = {
        id: payload?.userId || payload?.sub || null, // vissa token använder "sub" som id
        username: payload?.username || form.username, // använd JWT:ens username eller fallback till inmatat
        avatar: payload?.avatar || "https://i.pravatar.cc/200", // fallback-bild om fält saknas
      };

      // 6) Spara token + user i localStorage så att man förblir inloggad vid reload.
      saveAuth({ token, user });

      // 7) Skicka användaren till chatten nu när allt är klart.
      navigate("/chat");
    } catch (err) {
      // Om något går fel (fel lösenord, serverfel, nätverksfel…), visa ett enkelt felmeddelande.
      setError(err.message || "Något gick fel");
    } finally {
      // finally körs alltid, oavsett om try lyckades eller catch kördes.
      setLoading(false); // Stäng av "laddar"-läget
    }
  };

  // JSX = det vi ritar ut på sidan (formulär + knappar + feltext)
  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      {/* Rubrik överst */}
      <h1 className="text-2xl font-bold">Logga in</h1>

      {/* Fält för användarnamn */}
      <input
        type="text" // textfält
        name="username" // kopplas till form.username
        placeholder="Användarnamn" // grå hjälptext i fältet
        value={form.username} // visa värdet från state
        onChange={handleChange} // uppdatera state när man skriver
        className="border w-full p-2 rounded"
        autoComplete="username" // webbläsaren kan föreslå inmatningar
      />

      {/* Fält för lösenord */}
      <input
        type="password" // döljer texten (prickar)
        name="password" // kopplas till form.password
        placeholder="Lösenord" // hjälptext
        value={form.password} // visa värdet från state
        onChange={handleChange} // uppdatera state när man skriver
        className="border w-full p-2 rounded"
        autoComplete="current-password" // webbläsarhjälp
      />

      {/* Knappen som skickar formuläret */}
      <button
        type="submit" // triggar handleSubmit
        disabled={loading} // stäng av knappen när vi jobbar
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Loggar in..." : "Logga in"}{" "}
        {/* Visa text beroende på state */}
      </button>

      {/* Visa felmeddelande under knappen om något gick fel */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
