// src/pages/Chat.jsx
// React: state, effekter, memoisering, och referens (för auto-scroll)
import { useEffect, useMemo, useRef, useState } from "react";
// Våra API-funktioner för meddelanden
import { getMessages, createMessage, deleteMessage } from "../api/messages";

// Gör om ett godtyckligt API-svar till "vår" message-form så rendern alltid funkar
function normalizeMessage(apiMsg, { fallbackText = "", user } = {}) {
  const nowIso = new Date().toISOString();

  // Plocka id oavsett vad backenden kallar det
  const id =
    apiMsg?.id ??
    apiMsg?._id ??
    apiMsg?.messageId ??
    apiMsg?.uuid ??
    (window.crypto?.randomUUID ? crypto.randomUUID() : `temp-${nowIso}`);

  // Plocka avsändare
  const userId = apiMsg?.userId ?? apiMsg?.user?.id ?? user?.id ?? null;
  const userName =
    apiMsg?.userName ??
    apiMsg?.user?.username ??
    (userId === user?.id ? "Du" : "Användare");

  // Plocka text – backender kan kalla det olika; använd fallback om inget kom
  const text =
    apiMsg?.text ?? apiMsg?.content ?? apiMsg?.message ?? fallbackText ?? "";

  // Tid
  const createdAt = apiMsg?.createdAt ?? apiMsg?.created_at ?? nowIso;

  return {
    ...apiMsg, // behåll allt original också
    id,
    userId,
    userName,
    text,
    createdAt,
  };
}

// Liten hjälpare: hämta inloggad användare ur localStorage
function getUser() {
  const raw = localStorage.getItem("auth_user"); // läses in som text
  return raw ? JSON.parse(raw) : null; // gör om till objekt eller returnera null
}

export default function Chat() {
  // === UI-state ===
  const [messages, setMessages] = useState([]); // alla meddelanden vi ritar
  const [newMessage, setNewMessage] = useState(""); // textfältet längst ner
  const [loading, setLoading] = useState(false); // spinner/disable-knappar när vi jobbar
  const [error, setError] = useState(""); // felmeddelande att visa i UI

  // Inloggad användare (parsa bara en gång med useMemo)
  const user = useMemo(() => getUser(), []);
  const myUserId = user?.id || user?._id || user?.userId || null;

  // Ref till scroll-container så vi kan auto-scrolla till botten när listan ändras
  const listRef = useRef(null);

  // === 1) Hämta meddelanden vid första render ===
  useEffect(() => {
    let cancelled = false; // skydd om komponenten stängs innan fetch blir klar
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await getMessages(); // GET /api/messages (med JWT och ev. CSRF enligt din api/messages.js)
        if (!cancelled) {
          setMessages(Array.isArray(list) ? list : []); // spara listan (fallback till tom array)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Kunde inte hämta meddelanden");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // === 2) Auto-scroll till senaste meddelandet när messages ändras ===
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    // scrollar till botten (snyggt när nytt meddelande kommer in)
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);

    try {
      // 1) POST:a meddelandet
      const createdRaw = await createMessage({ content: trimmed });

      // 2) Normalisera svaret så vi GARANTERAT har text/id/userId/createdAt
      const created = normalizeMessage(createdRaw, {
        fallbackText: trimmed,
        user,
      });

      // 3) Lägg in direkt i listan (optimistiskt)
      setMessages((prev) => [...prev, created]);

      // 4) Töm input
      setNewMessage("");

      // 5) (VALFRITT MEN ROBUST) Hämta om listan från servern
      //    Detta säkerställer att ordning/fält exakt matchar backend
      try {
        const fresh = await getMessages();
        setMessages(Array.isArray(fresh) ? fresh : []);
      } catch {
        // ignorera tyst om GET misslyckas – vi har redan visat optimistiskt
      }
    } catch (err) {
      setError(err.message || "Kunde inte skicka meddelande");
    } finally {
      setLoading(false);
    }
  }

  // === 4) Radera ett meddelande ===
  async function handleDelete(idLike) {
    // Säkerställ att vi har ett id att radera med
    const messageId = idLike;
    if (!messageId) return;

    const ok = confirm("Vill du radera meddelandet?");
    if (!ok) return;

    setError("");
    setLoading(true);

    try {
      await deleteMessage(messageId); // DELETE /api/messages/:id
      // Ta bort från UI:t
      setMessages((prev) =>
        prev.filter((m) => (m.id || m._id || m.messageId) !== messageId)
      );
    } catch (err) {
      setError(err.message || "Kunde inte radera meddelande");
    } finally {
      setLoading(false);
    }
  }

  // === 5) Hjälpare för bubbel-styling (mina höger, andras vänster) ===
  function bubbleClasses(isMine) {
    return [
      "max-w-[70%] rounded-2xl px-4 py-2 shadow",
      isMine
        ? "bg-blue-600 text-white self-end"
        : "bg-gray-100 text-gray-900 self-start",
    ].join(" ");
  }

  // === 6) Förbered en ren, filtrerad lista innan render ===
  const safeMessages = useMemo(() => {
    return (Array.isArray(messages) ? messages : [])
      .filter(Boolean) // inga null/undefined
      .filter((m) => typeof m.text === "string"); // visa bara poster som faktiskt har text-fält
  }, [messages]);

  return (
    <div className="flex min-h-screen">
      {/* Huvudkolumn – lägg ev. <SideNav /> som ett syskon */}
      <main className="flex-1 flex flex-col p-4 gap-4">
        <h1 className="text-2xl font-bold">Chat</h1>

        {/* Felruta */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* === Meddelandelista === */}
        <section
          ref={listRef} // behövs för auto-scroll
          className="flex-1 flex flex-col gap-2 overflow-y-auto border rounded p-3 bg-white"
          style={{ minHeight: 300 }}
        >
          {/* Ladd-text vid initial hämtning */}
          {loading && safeMessages.length === 0 && (
            <p className="text-gray-500">Laddar meddelanden…</p>
          )}

          {/* Rendera varje meddelande med GARANTERAT unik key */}
          {safeMessages.map((m, idx) => {
            const isMine =
              myUserId && (m.userId === myUserId || m.user?.id === myUserId);

            // Försök med API:ets riktiga nycklar först, annars använd index som sista utväg.
            const key =
              m.id ??
              m._id ??
              m.messageId ??
              m.uuid ??
              `${m.userId ?? "u"}-${m.createdAt ?? "t"}-${idx}`;

            // Vilket id ska vi använda när vi raderar?
            const idForDelete = m.id || m._id || m.messageId;

            return (
              <div key={key} className={bubbleClasses(isMine)}>
                {/* Liten information över bubblan */}
                <div className="text-xs opacity-75 mb-1">
                  {isMine
                    ? "Du"
                    : m.userName || m.user?.username || "Användare"}
                  {m.createdAt
                    ? ` • ${new Date(m.createdAt).toLocaleString()}`
                    : null}
                </div>

                {/* Själva texten */}
                <div>{m.text}</div>

                {/* Radera-knapp på egna meddelanden om id finns */}
                {isMine && idForDelete && (
                  <button
                    onClick={() => handleDelete(idForDelete)}
                    className="mt-1 text-xs underline opacity-80 hover:opacity-100"
                    title="Radera meddelande"
                  >
                    Radera
                  </button>
                )}
              </div>
            );
          })}

          {/* Tom-state */}
          {!loading && safeMessages.length === 0 && (
            <p className="text-gray-500">
              Inga meddelanden ännu. Skriv ditt första!
            </p>
          )}
        </section>

        {/* === Skrivrad / nytt meddelande === */}
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
