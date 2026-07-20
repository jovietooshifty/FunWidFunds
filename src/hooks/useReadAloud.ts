import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "funwidfunds-read-aloud";

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  // Prefer a warm, clear English voice
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && /female|samantha|karen|fiona/i.test(v.name),
  );
  return preferred ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

export function useReadAloud() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load voice (may be async on some browsers)
  useEffect(() => {
    voiceRef.current = pickVoice();
    const handler = () => { voiceRef.current = pickVoice(); };
    speechSynthesis.addEventListener("voiceschanged", handler);
    return () => speechSynthesis.removeEventListener("voiceschanged", handler);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? "on" : "off"); } catch { /* noop */ }
      if (!next) speechSynthesis.cancel();
      return next;
    });
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !text) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      speechSynthesis.speak(utterance);
    },
    [enabled],
  );

  return { enabled, toggle, speak };
}
