import React, { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./components/MessageBubble";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { useTheme } from "./hooks/useTheme";
import { useChat } from "./hooks/useChat";
import { initializeUserTracking } from "./services/trackingService";
import { QUESTION_POOL } from "./data/questionPool";
import { RLM } from "./config";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

function App() {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const { darkMode, setDarkMode } = useTheme();
  const {
    messages,
    input,
    setInput,
    isLoading,
    replyContext,
    setReplyContext,
    handleSend,
    handleClearChat,
  } = useChat();

  const [suggestions, setSuggestions] = useState<
    { icon: string; text: string }[]
  >([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedFromUrl = useRef(false);

  useEffect(() => {
    initializeUserTracking();
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    const path = window.location.pathname;
    const segments = path.split("/").filter((s) => s && s !== "index.html");

    if (segments.length > 0) {
      const slug = decodeURIComponent(segments[0]);
      const slugWords = slug.split(/[\s-]/).filter((w) => w.length > 2);
      const related = QUESTION_POOL.filter((q) =>
        slugWords.some((word) => q.text.includes(word)) || q.text.includes(slug)
      );
      setSuggestions(
        related.length >= 3
          ? [
            ...related.slice(0, 4),
            ...shuffled.filter((s) => !related.includes(s)).slice(0, 2),
          ].sort(() => 0.5 - Math.random())
          : shuffled.slice(0, 6),
      );
      document.title = `${RLM}BIOבוט - ${slug}`;
    } else {
      setSuggestions(shuffled.slice(0, 6));
      document.title = `${RLM}BIOבוט`;
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const onClearClick = () => {
    if (confirmClear) {
      handleClearChat(true);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  useEffect(() => {
    if (initializedFromUrl.current) return;
    const path = window.location.pathname;
    const segments = path.split("/").filter((s) => s && s !== "index.html");
    const params = new URLSearchParams(window.location.search);
    const queryText = params.get("q") || params.get("text");

    if (segments.length > 0 || queryText) {
      initializedFromUrl.current = true;
      const slug = segments.length > 0 ? decodeURIComponent(segments[0]) : "";
      const pathText = segments.slice(1).map((s) => decodeURIComponent(s)).join(
        " ",
      );
      const initialPrompt = pathText || queryText || slug;
      if (initialPrompt && !messages.some((m) => m.content === initialPrompt)) {
        setTimeout(() => handleSend(initialPrompt), 800);
      }
    }
  }, [messages, handleSend]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative transition-colors duration-300">
      <Header
        isInstallable={isInstallable}
        handleInstallClick={handleInstallClick}
        handleClearChat={onClearClick}
        confirmClear={confirmClear}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-gray-900 scroll-smooth">
        {messages.length === 0
          ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in pt-20">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                שלום! אני {RLM}BIOבוט.
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                אני כאן כדי לעזור לך להבין ביולוגיה בצורה כיפית. על מה נדבר
                היום?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-bio-400 dark:hover:border-bio-500 hover:shadow-md transition-all text-right font-medium text-gray-700 dark:text-gray-200 group"
                  >
                    <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] transition-transform group-hover:scale-110">
                      {s.icon}
                    </span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )
          : (
            <>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onReply={(text, id) => setReplyContext({ text, id })}
                    onTopicClick={(topic) =>
                      handleSend(`ספר לי עוד על ${topic}`)}
                  />
                ))}
              </div>
              <div ref={messagesEndRef} />
            </>
          )}
      </main>
      <Footer
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        replyContext={replyContext}
        setReplyContext={setReplyContext}
        handleSend={handleSend}
      />
    </div>
  );
}

export default App;
