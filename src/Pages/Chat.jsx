// Chat.jsx

import { useState, useEffect } from "react";
import { getMessages, createMessage, deleteMessage } from "../api/messages";

// Hämta användaren som är inloggad från localStorage
function getUser() {
  const raw = localStorage.getItem("auth_user");
  return raw ? JSON.parse(raw) : null;
}

// Hjälpfunktion: formatera tid till "YYYY-MM-DD HH:mm" i UTC
function formatUtcDateTime(isoString) {
  const d = new Date(isoString);

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0"); // månader börjar på 0
  const day = String(d.getUTCDate()).padStart(2, "0");

  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = getUser();
  const myUserId = user?.id;

  // === Hämta alla meddelanden vid start ===
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const list = await getMessages();
        setMessages(list);
      } catch (err) {
        setError("Kunde inte hämta meddelanden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // === Skicka meddelande ===
  async function handleSend(e) {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const created = await createMessage({ content: trimmed });
      setMessages((prev) => [...prev, created]);
      setNewMessage("");
    } catch (err) {
      setError("Kunde inte skicka meddelande");
    } finally {
      setLoading(false);
    }
  }

  // === Radera meddelande ===
  async function handleDelete(id) {
    if (!confirm("Vill du radera meddelandet?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Kunde inte radera meddelande");
    } finally {
      setLoading(false);
    }
  }

  // Hjälpfunktion för bubblor
  function bubbleClasses(isMine) {
    return isMine
      ? "bg-blue-600 text-white self-end rounded-xl p-2 max-w-[70%]"
      : "bg-gray-200 text-black self-start rounded-xl p-2 max-w-[70%]";
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 flex flex-col p-4 gap-4">
        <h1 className="text-2xl font-bold">Chat</h1>

        {error && <div className="text-red-600">{error}</div>}

        {/* Meddelandelista */}
        <section className="flex-1 flex flex-col gap-2 overflow-y-auto border rounded p-3 bg-white">
          {loading && messages.length === 0 && (
            <p className="text-gray-500">Laddar…</p>
          )}

          {messages.map((m) => {
            const isMine = m.userId === myUserId;
            return (
              <div key={m.id} className={bubbleClasses(isMine)}>
                {/* Info-rad ovanför meddelandet */}
                <div className="text-xs opacity-70 mb-1">
                  {isMine ? "Du" : m.userName || "Användare"} •{" "}
                  {m.createdAt ? formatUtcDateTime(m.createdAt) : ""}
                </div>

                {/* Själva texten */}
                <div>{m.text}</div>

                {/* Radera-knapp */}
                {isMine && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-xs underline mt-1"
                  >
                    Radera
                  </button>
                )}
              </div>
            );
          })}

          {!loading && messages.length === 0 && (
            <p className="text-gray-500">Inga meddelanden ännu…</p>
          )}
        </section>

        {/* Formulär för nytt meddelande */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Skriv något…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            Skicka
          </button>
        </form>
      </main>
    </div>
  );
}
