// Reacts useState och useEffect – för att spara formulärdata och reagera på sidladdning
import { useEffect, useState } from "react";

// Våra API- och hjälpfunktioner
import { getCsrfToken, loginUser } from "../api/auth"; // hämta CSRF och logga in
import { getCookie, saveAuth, getAuth } from "../utils/token"; // cookies och localStorage
import { decodeJwt } from "../utils/jwt"; // läsa ut info ur JWT

// useNavigate för att kunna redirecta användaren efter login
import { useNavigate } from "react-router-dom";

export default function Login() {
  // form-objekt som håller det användaren skriver in
  const [form, setForm] = useState({
    username: "", // användarnamn från input
    password: "", // lösenord från input
  });

  // UI-states för fel/success och "laddning" (disable knapp etc.)
  const [error, setError] = useState(""); // visar felmeddelanden (t.ex. "Invalid credentials")
  const [loading, setLoading] = useState(false); // visar att vi jobbar (för att undvika dubbelklick)
  const navigate = useNavigate(); // används för att byta sida (t.ex. till /chat)

  // När sidan laddar: om vi redan har en token i localStorage -> gå direkt till /chat
  useEffect(() => {
    // Läs auth-data från localStorage
    const { token } = getAuth(); // plocka ut token om det finns

    // Om token finns -> användaren är redan "inloggad"
    if (token) {
      navigate("/chat"); // skicka användaren till chatten
    }
  }, [navigate]); // körs en gång (eller när navigate referens ändras)

  // Uppdatera form-state när användaren skriver i fält
  const handleChange = (e) => {
    // e.target.name är "username" eller "password"
    // e.target.value är det som skrivits in
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); // kopiera det gamla och uppdatera fältet
  };

  // När användaren trycker på "Logga in"
  const handleSubmit = async (e) => {
    e.preventDefault(); // stoppa webbläsarens standardbeteende (som laddar om sidan)

    // Rensa ev. gamla fel
    setError(""); // ta bort tidigare fel
    setLoading(true); // visa att vi jobbar (t.ex. disable knappen)

    try {
      // 1) Hämta CSRF först (så vi får rätt cookie)
      await getCsrfToken(); // genererar/uppdaterar XSRF-TOKEN i cookies

      // 2) Läs ut token-värdet från cookie så vi kan skicka den i headern
      const csrfToken = getCookie("XSRF-TOKEN"); // hämta cookie-värdet
      if (!csrfToken) {
        // Om vi inte hittar cookien, kasta ett fel
        throw new Error("Kunde inte hitta CSRF-token i cookies");
      }

      // 3) Anropa API för att logga in (POST /auth/token)
      const data = await loginUser({
        username: form.username, // skicka användarnamn från formuläret
        password: form.password, // skicka lösenord från formuläret
        csrfToken, // skicka med CSRF-värdet i header (sker i loginUser)
      });

      // Förväntat: data.token = JWT-string
      const token = data?.token; // plocka ut token från svaret

      if (!token) {
        // Om inget token kom tillbaka – något är fel
        throw new Error("Token saknas i svaret från servern");
      }

      // 4) Dekoda JWT för att få ut användarinfo (t.ex. userId, username, avatar)
      const payload = decodeJwt(token); // { sub/userId, username, avatar, exp, ... } beroende på API
      // OBS: Se i praktiken vilka fält Chatify-tokenen har. Nedan gör vi rimliga antaganden:

      // Bygg ett "user"-objekt att spara. Använd de fält som finns i ditt JWT.
      const user = {
        id: payload?.userId || payload?.sub || null, // fallback om namnen skiljer sig
        username: payload?.username || form.username,
        avatar: payload?.avatar || "https://i.pravatar.cc/200", // fallback-bild om JWT saknar avatar
      };

      // 5) Spara token + user i localStorage så vi är inloggade även efter reload
      saveAuth({ token, user });

      // 6) Skicka användaren vidare till chatten (eller vart du vill)
      navigate("/chat"); // success – vidare till chatten!
    } catch (err) {
      // Om något gick snett (fel lösenord, nätverksfel, etc.)
      setError(err.message || "Något gick fel"); // visa felmeddelandet i UI
    } finally {
      // Detta körs alltid – oavsett om try lyckades eller catch kördes
      setLoading(false); // stäng av "laddar"-läget
    }
  };

  return (
    // Formulärcontainer med lite Tailwind-styling
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      {/* Rubrik */}
      <h1 className="text-2xl font-bold">Logga in</h1>

      {/* Användarnamn-fält */}
      <input
        type="text" // text-input
        name="username" // kopplar till form.username
        placeholder="Användarnamn" // hjälptext i fältet
        value={form.username} // visa nuvarande värde från state
        onChange={handleChange} // uppdatera state när man skriver
        className="border w-full p-2 rounded"
        autoComplete="username" // låt webbläsaren hjälpa till
      />

      {/* Lösenords-fält */}
      <input
        type="password" // döljer texten
        name="password" // kopplar till form.password
        placeholder="Lösenord" // hjälptext
        value={form.password} // visa nuvarande värde
        onChange={handleChange} // uppdatera state
        className="border w-full p-2 rounded"
        autoComplete="current-password" // webbläsarhjälp
      />

      {/* Submit-knapp */}
      <button
        type="submit" // skickar formuläret
        disabled={loading} // stäng av knappen när vi jobbar
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Loggar in..." : "Logga in"}{" "}
        {/* visa "Loggar in..." när loading=true */}
      </button>

      {/* Visa felmeddelande om något gick snett */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
