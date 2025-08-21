// src/pages/Chat.jsx

// Hooks: state, effekt, memo
import { useEffect, useMemo, useState } from "react";

// Våra API-anrop (måste redan vara kopplade till JWT + CSRF i ../api/messages)
import { getMessages, createMessage, deleteMessage } from "../api/messages";

/* ================= Hjälpfunktioner ================= */

// Hämta inloggad användare (sparad i localStorage vid login)
function getUser() {
  const raw = localStorage.getItem("auth_user"); // text
  return raw ? JSON.parse(raw) : null; // objekt eller null
}

// Format: UTC "YYYY-MM-DD HH:mm"
function formatUtcDateTime(iso) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${da} ${h}:${m}`;
}

// Är meddelandet mitt? (fallbackar på flera vanliga fält)
function computeIsMine(msg, me, myUserId) {
  if (msg.isFake) return false; // fejkade är aldrig mina
  if (msg.isMine === true) return true; // om vi redan flaggat det
  if (myUserId && (msg.userId === myUserId || msg.user?.id === myUserId))
    return true;
  if (
    me?.username &&
    (msg.userName === me.username || msg.username === me.username)
  )
    return true;
  return false;
}

/* ================= Komponent ================= */

export default function Chat() {
  // Riktiga meddelanden från API
  const [messages, setMessages] = useState([]);
  // Fejkade (Emma) – visas till vänster
  const [fakeChat, setFakeChat] = useState([
    {
      id: "f1",
      isFake: true,
      text: "Hej, hej, hej!",
      username: "Emma",
      createdAt: new Date().toISOString(),
    },
    {
      id: "f2",
      isFake: true,
      text: "Vad gör du?",
      username: "Emma",
      createdAt: new Date().toISOString(),
    },
  ]);

  // UI-state
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Jag själv
  const me = useMemo(() => getUser(), []);
  const myUserId = me?.id || me?._id || me?.userId || null;

  // 1) Hämta meddelanden vid start
  useEffect(() => {
    (async () => {
      setError("");
      try {
        const list = await getMessages();

        // Normalisera & flagga "isMine"
        const normalized = (Array.isArray(list) ? list : []).map((m) => ({
          ...m,
          text: m.text ?? m.content ?? "",
          createdAt: m.createdAt || m.created_at || new Date().toISOString(),
          isMine: computeIsMine(m, me, myUserId),
        }));

        setMessages(normalized);
      } catch (err) {
        setError(err.message || "Kunde inte hämta meddelanden");
      }
    })();
  }, [me, myUserId]);

  // 2) Skicka ett nytt (riktigt) meddelande
  async function handleSend(e) {
    e.preventDefault();
    const txt = newMessage.trim();
    if (!txt) return;

    setLoading(true);
    setError("");

    try {
      const createdFromApi = await createMessage({ content: txt });

      // Se till att UI alltid har fält vi behöver
      const created = {
        ...createdFromApi,
        text: createdFromApi.text ?? txt,
        createdAt:
          createdFromApi.createdAt ||
          createdFromApi.created_at ||
          new Date().toISOString(),
        userId: createdFromApi.userId || createdFromApi.user?.id || myUserId,
        userName:
          createdFromApi.userName ||
          createdFromApi.user?.username ||
          me?.username ||
          "Du",
        isMine: true, // ← markera att det är mitt → högersida
      };

      setMessages((prev) => [...prev, created]);
      setNewMessage("");
    } catch (err) {
      setError(err.message || "Kunde inte skicka meddelande");
    } finally {
      setLoading(false);
    }
  }

  // 3) Radera meddelande (fejk: lokalt, riktigt: API)
  async function handleDeleteMessage(msg) {
    if (msg.isFake) {
      setFakeChat((prev) => prev.filter((x) => x.id !== msg.id));
      return;
    }

    const ok = confirm("Vill du radera meddelandet?");
    if (!ok) return;

    const id = msg.id || msg._id;
    if (!id) return;

    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((x) => (x.id || x._id) !== id));
    } catch (err) {
      setError(err.message || "Kunde inte radera meddelande");
    }
  }

  /* ========= Bygg en säker lista för render (unika keys, inga dubbletter) ========= */

  const allMessages = useMemo(() => {
    // lägg fejk först så det ser ut som att Emma skrev innan du svarade
    const combined = [...fakeChat, ...messages];

    const seen = new Set();
    const out = [];

    combined.forEach((m, idx) => {
      // bygg en robust key
      const key =
        m?.id ??
        m?._id ??
        `${m?.userId ?? "u"}-${m?.createdAt ?? "t"}-${(m?.text ?? "").slice(
          0,
          16
        )}-${idx}`;

      if (!seen.has(key)) {
        seen.add(key);
        out.push({ ...m, __key: key });
      }
    });

    return out;
  }, [fakeChat, messages]);

  /* ================= Utseende på bubblor (höger/vänster) ================= */

  function bubbleClasses(isMine) {
    // w-fit gör bubblan lika bred som innehållet;
    // ml-auto trycker mina bubblor till höger
    return isMine
      ? "ml-auto w-fit max-w-[70%] bg-blue-600 text-white rounded-2xl px-4 py-2 shadow"
      : "mr-auto w-fit max-w-[70%] bg-gray-100 text-gray-900 rounded-2xl px-4 py-2 shadow";
  }

  /* ================== Render ================== */

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 flex flex-col p-4 gap-4">
        <h1 className="text-2xl font-bold">Chat</h1>

        {error && <div className="text-red-500">{error}</div>}

        {/* Viktigt: items-start gör att barn inte stretchas fullbredd */}
        <section className="flex-1 flex flex-col items-start gap-2 overflow-y-auto border rounded p-3 bg-white">
          {/* Laddtext när listan är tom */}
          {loading && allMessages.length === 0 && (
            <p className="text-gray-500">Laddar…</p>
          )}

          {/* Själva listan */}
          {allMessages.map((m) => {
            const isMine = m.isMine === true; // enkel, tydlig regel

            const name = isMine
              ? `Du (${me?.username ?? "okänd"})`
              : m.username || m.userName || "Användare";

            const time =
              m.createdAt || m.created_at
                ? ` • ${formatUtcDateTime(m.createdAt || m.created_at)}`
                : "";

            return (
              <div key={m.__key} className={bubbleClasses(isMine)}>
                {/* Info-rad (namn + tid) */}
                <div className="text-xs opacity-70 mb-1">
                  {name}
                  {time}
                </div>

                {/* Text */}
                <div>{m.text}</div>

                {/* Radera-knapp */}
                <button
                  onClick={() => handleDeleteMessage(m)}
                  className="text-xs underline mt-1 opacity-80 hover:opacity-100"
                >
                  Radera
                </button>
              </div>
            );
          })}

          {/* Tom-state */}
          {!loading && allMessages.length === 0 && (
            <p className="text-gray-500">Inga meddelanden ännu…</p>
          )}
        </section>

        {/* Skrivrad */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Skriv ett meddelande…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Skickar…" : "Skicka"}
          </button>
        </form>
      </main>
    </div>
  );
}
