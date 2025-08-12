// Vår sida för att skapa konto / Sidan där man registrerar sig
import { useState } from "react";
import { getCsrfToken } from "../api/auth";
import { getCookie } from "../utils/token";

export default function Register() {
  // form = ett objekt som sparar det användaren skriver in
  const [form, setForm] = useState({
    username: "", // användarnamn
    email: "", // e-post
    password: "", // lösenord
  });

  // error = visar felmeddelanden från servern
  const [error, setError] = useState("");

  // success = visar meddelande om allt gick bra
  const [success, setSuccess] = useState("");

  // Denna funktion körs varje gång användaren skriver i ett inputfält
  const handleChange = (e) => {
    setForm({
      ...form, // behåll gamla värden
      [e.target.name]: e.target.value, // uppdatera det fält som användaren ändrat
    });
  };

  // Denna funktion körs när man klickar på knappen "Registrera"
  const handleSubmit = async (e) => {
    e.preventDefault(); // stoppar formuläret från att ladda om sidan

    try {
      await getCsrfToken(); // hämta säkerhets-token från API:et

      // hämta värdet på XSRF-token från cookies
      const csrfToken = getCookie("XSRF-TOKEN");

      // Skicka POST-anrop till API:et för att registrera användare
      const res = await fetch(
        "https://chatify-api.up.railway.app/auth/register",
        {
          method: "POST", // POST = skicka ny data
          headers: {
            "Content-Type": "application/json", // vi skickar data i JSON-format
            "X-CSRF-Token": csrfToken, // viktigt! måste skickas med annars får vi 403
          },
          credentials: "include", // se till att cookies skickas med
          body: JSON.stringify(form), // omvandla vårt form-objekt till text
        }
      );

      // Konvertera svaret från servern till ett JavaScript-objekt
      const data = await res.json();

      if (!res.ok) {
        // Om något gick fel, visa felmeddelandet från servern
        setError(data.message); // t.ex. "Username or email already exists"
        setSuccess("");
      } else {
        // Allt gick bra – användaren skapades
        setSuccess("Registrering lyckades!");
        setError("");

        // Efter 1 sekund skicka användaren till login-sidan
        setTimeout(() => {
          window.location.href = "/login"; // viktigt att denna route existerar
        }, 1000);
      }
    } catch (err) {
      // Om något gick oväntat fel (t.ex. ingen internetanslutning)
      setError("Något gick fel");
      setSuccess("");
    }
  };

  return (
    // Själva formuläret för registrering
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Registrera dig</h1>

      {/* Inputfält för användarnamn */}
      <input
        type="text"
        name="username"
        placeholder="Användarnamn"
        onChange={handleChange}
        className="border w-full p-2"
      />

      {/* Inputfält för e-post */}
      <input
        type="email"
        name="email"
        placeholder="E-post"
        onChange={handleChange}
        className="border w-full p-2"
      />

      {/* Inputfält för lösenord */}
      <input
        type="password"
        name="password"
        placeholder="Lösenord"
        onChange={handleChange}
        className="border w-full p-2"
      />

      {/* Knappen för att skicka formuläret */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Registrera
      </button>

      {/* Om det finns fel, visa det i rött */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Om det gick bra, visa grön text */}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
}
