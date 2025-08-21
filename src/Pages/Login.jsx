// Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Våra API-funktioner
import { getCsrfToken, loginUser } from "../api/auth";

// Funktioner för att spara/hämta från localStorage
import { saveAuth, getAuth } from "../utils/token";

// Liten hjälpfunktion: dekoda JWT för att få fram info om användaren
import { decodeJwt } from "../utils/jwt";

export default function Login() {
  // === State för input-fälten ===
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // === State för fel och laddning ===
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // === Navigering till /chat när man lyckas logga in ===
  const navigate = useNavigate();

  // === Om användaren redan är inloggad, hoppa direkt till chatten ===
  useEffect(() => {
    const { token } = getAuth();
    if (token) {
      navigate("/chat", { replace: true });
    }
  }, [navigate]);

  // === När man klickar på "Logga in" ===
  async function handleSubmit(e) {
    e.preventDefault(); // stoppa sid-omladdning
    setError("");
    setLoading(true);

    try {
      // 1) Hämta CSRF-token från servern
      const csrfToken = await getCsrfToken();

      // 2) Skicka login-request med användarnamn, lösenord + CSRF-token
      const data = await loginUser({
        username,
        password,
        csrfToken,
      });

      // 3) API:t svarar med en JWT-token
      const token = data?.token;
      if (!token) {
        throw new Error("Ingen token i svaret från servern");
      }

      // 4) Dekoda JWT för att få användarinfo
      const payload = decodeJwt(token);

      const user = {
        id: payload?.userId || payload?.sub || null,
        username: payload?.username || username,
        avatar: payload?.avatar || "https://i.pravatar.cc/200",
      };

      // 5) Spara token + user i localStorage
      saveAuth({ token, user });

      // 6) Gå vidare till chatten
      navigate("/chat");
    } catch (err) {
      setError(err.message || "Fel vid inloggning");
    } finally {
      setLoading(false);
    }
  }

  // === UI ===
  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Logga in</h1>

      {/* Användarnamn */}
      <input
        type="text"
        placeholder="Användarnamn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border w-full p-2 rounded"
      />

      {/* Lösenord */}
      <input
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border w-full p-2 rounded"
      />

      {/* Logga in-knapp */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Loggar in..." : "Logga in"}
      </button>

      {/* Felmeddelande */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
