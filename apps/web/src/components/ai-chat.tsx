import { igdbImage } from "@playdary/design-system";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, Database, Sparkles, Square, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import { useAiChat, type AiMessage, type AiStatus, type ChatCard } from "../lib/ai-chat";
import "./ai-chat.css";

const SUGGESTIONS = ["Jakie gry mają najbliższą premierę?", "Polecisz coś z najwyższą oceną?", "Pokaż gry RPG", "Co mam na swoich listach?"];

const STATUS_LABEL: Record<AiStatus, { text: string; tone: "ok" | "busy" | "warn" | "down" }> = {
  ready: { text: "Połączony z bazą gier", tone: "ok" },
  streaming: { text: "Odpowiada…", tone: "busy" },
  fallback: { text: "Odpowiada model zapasowy", tone: "warn" },
  unavailable: { text: "Asystent niedostępny", tone: "down" },
  limit: { text: "Dzienny limit wyczerpany", tone: "warn" },
};

const TOOL_LABEL: Record<string, string> = {
  search_games: "Przeszukuję bazę gier…",
  upcoming_releases: "Sprawdzam premiery…",
  similar_games: "Szukam podobnych gier…",
  my_lists: "Czytam Twoje listy…",
};

const plural = (n: number) => `${n} ${n === 1 ? "wynik" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "wyniki" : "wyników"}`;

const cardSubtitle = (card: ChatCard) =>
  [card.release_date ? new Date(card.release_date).toLocaleDateString("pl-PL") : "Data TBA", card.score ? `ocena ${card.score}` : null].filter(Boolean).join(" · ");

const seconds = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

const focusSearch = () => document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();

function Note({ message, onSearch }: { message: AiMessage; onSearch: () => void }) {
  if (message.state === "limit") return <div className="pgai-note">Wykorzystano dzienny limit pytań do asystenta. Odnowi się jutro.</div>;
  if (message.state === "unavailable")
    return (
      <div className="pgai-note">
        Asystent jest chwilowo niedostępny. Możesz skorzystać ze zwykłego wyszukiwania.
        <button type="button" onClick={onSearch}>Zwykłe wyszukiwanie</button>
      </div>
    );
  if (message.state === "interrupted") return <div className="pgai-note">Odpowiedź urwała się w połowie. Zadaj pytanie ponownie.</div>;
  if (message.state === "stopped") return <div className="pgai-meta">Zatrzymano</div>;
  return null;
}

function Reply({ message, onOpenGame, onSearch }: { message: AiMessage; onOpenGame: (id: number) => void; onSearch: () => void }) {
  const streaming = message.state === "streaming";
  const running = message.tools.find((tool) => tool.state === "running");
  const finished = message.tools.filter((tool) => tool.state === "done");
  const found = finished.reduce((sum, tool) => sum + (tool.count ?? 0), 0);

  return (
    <div className="pgai-m">
      {finished.length > 0 && (
        <div className="pgai-tool">
          <Database size={14} aria-hidden />
          Zapytanie do bazy · {plural(found)}
        </div>
      )}
      {running && (
        <div className="pgai-tool">
          <span className="pgai-spin" />
          {TOOL_LABEL[running.name] ?? "Przeszukuję bazę…"}
        </div>
      )}
      {message.content && (
        <div className="typeset typeset-chat">
          <Markdown components={{ a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>{message.content}</Markdown>
        </div>
      )}
      {streaming && !running && !message.content && (
        <div className="pgai-dots">
          <i />
          <i />
          <i />
        </div>
      )}
      {message.cards.length > 0 && (
        <div className="pgai-cards">
          {message.cards.map((card) => (
            <button key={card.id} type="button" className="pgai-card" aria-label={`Zobacz grę: ${card.name}`} onClick={() => onOpenGame(card.id)}>
              <span className="pgai-card-c">{card.cover ? <img src={igdbImage(card.cover, "t_cover_small")} alt="" loading="lazy" /> : card.name.charAt(0)}</span>
              <span>
                <span className="pgai-card-t">{card.name}</span>
                <span className="pgai-card-s">{cardSubtitle(card)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <Note message={message} onSearch={onSearch} />
      {message.state === "done" && message.model && (
        <div className="pgai-meta">
          {message.model.label}
          {message.model.fallback ? " (zapasowy)" : ""}
          {message.ms ? ` · ${seconds(message.ms)}` : ""}
        </div>
      )}
    </div>
  );
}

export function AiChat() {
  const navigate = useNavigate();
  const { messages, status, remaining, send, stop, clear } = useAiChat();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const streaming = status === "streaming" || status === "fallback";
  const state = STATUS_LABEL[status];

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (streaming) return stop();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

  const openGame = (id: number) => {
    setOpen(false);
    void navigate({ to: "/games/$gameId", params: { gameId: String(id) } });
  };

  const plainSearch = () => {
    setOpen(false);
    focusSearch();
  };

  return (
    <>
      <button type="button" className={`pgai-fab ${open ? "hide" : ""}`} aria-label="Otwórz asystenta AI" aria-expanded={open} onClick={() => setOpen(true)}>
        <Sparkles size={20} aria-hidden />
        <span>Zapytaj AI</span>
      </button>
      <section className={`pgai ${open ? "open" : ""}`} role="dialog" aria-label="Asystent AI Playdary" aria-hidden={!open}>
        <header className="pgai-h">
          <span className="pgai-av"><Sparkles size={18} aria-hidden /></span>
          <div>
            <div className="pgai-ht">Asystent Playdary</div>
            <div className="pgai-hs" role="status"><i className="pgai-dot" data-tone={state.tone} />{state.text}</div>
          </div>
          <div className="pgai-hb">
            <button type="button" className="pgai-ib" aria-label="Wyczyść rozmowę" onClick={clear}><Trash2 size={18} aria-hidden /></button>
            <button type="button" className="pgai-ib" aria-label="Zamknij czat" onClick={() => setOpen(false)}><X size={18} aria-hidden /></button>
          </div>
        </header>
        <div className="pgai-prov"><span className="pgai-auto">Model: Auto</span></div>
        <div ref={body} className="pgai-body" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="pgai-empty">
              <h3>Zapytaj Playdary</h3>
              <p>Odpowiadam na podstawie bazy gier: premiery, oceny, gatunki i Twoje listy.</p>
              <div className="pgai-sugs">
                {SUGGESTIONS.map((suggestion) => (
                  <button key={suggestion} type="button" className="pgai-sug" onClick={() => void send(suggestion)}>{suggestion}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="pgai-m pgai-m--u"><div className="pgai-b">{message.content}</div></div>
            ) : (
              <Reply key={message.id} message={message} onOpenGame={openGame} onSearch={plainSearch} />
            ),
          )}
        </div>
        <form className="pgai-f" onSubmit={submit}>
          <input ref={input} type="text" autoComplete="off" maxLength={2000} placeholder="Zapytaj o gry, premiery, swoje listy…" aria-label="Wiadomość do asystenta" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={status === "limit"} />
          <button type="submit" className="pgai-send" aria-label={streaming ? "Zatrzymaj" : "Wyślij"} disabled={!streaming && (!draft.trim() || status === "limit")}>
            {streaming ? <Square size={14} fill="currentColor" aria-hidden /> : <ArrowUp size={18} aria-hidden />}
          </button>
        </form>
        <div className="pgai-foot">
          Odpowiedzi generuje model AI na podstawie bazy. Mogą zawierać błędy.
          {remaining !== null && ` Pozostało pytań dziś: ${remaining}.`}
        </div>
      </section>
    </>
  );
}
