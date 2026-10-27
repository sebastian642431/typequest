import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { useLocaleMeta, useT } from "../i18n/index.ts";

function clean(text: string) {
  return text.replace(/`([^`]+)`/g, "$1").replace(/[{}[\]<>|&;=]/g, " ");
}

function voiceFor(lang: string) {
  const voices = speechSynthesis.getVoices();
  const base = lang.split("-")[0];
  return voices.find((v) => v.lang.toLowerCase().startsWith(`${base}-ar`)) ?? voices.find((v) => v.lang.toLowerCase().startsWith(base)) ?? null;
}

export function ListenButton({ text }: { text: string }) {
  const t = useT();
  const meta = useLocaleMeta();
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => () => {
    if (supported) speechSynthesis.cancel();
  }, [supported, text]);

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean(text));
    u.lang = meta.voiceLang;
    const voice = voiceFor(meta.voiceLang);
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(u);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={speaking ? t.theory.stop : t.theory.listen}
      aria-pressed={speaking}
      className={`grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors ${
        speaking ? "border-accent bg-accent text-on-accent" : "border-line bg-surface text-accent shadow-[0_3px_0_0_var(--c-line)] hover:bg-surface-2"
      }`}
    >
      {speaking ? <Square className="size-4 fill-current" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
    </button>
  );
}
