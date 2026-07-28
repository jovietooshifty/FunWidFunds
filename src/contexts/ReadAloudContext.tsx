import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "funwidfunds-read-aloud";

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  // Prefer a warm, clear English voice
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && /female|samantha|karen|fiona|zira/i.test(v.name),
  );
  return preferred ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

interface ReadAloudValue {
  enabled: boolean;
  toggle: () => void;
  /** Speak text now (no-op when muted). Stable across renders. */
  speak: (text: string) => void;
  /** Stop any in-progress speech. Stable across renders. */
  cancel: () => void;
}

const ReadAloudContext = createContext<ReadAloudValue | null>(null);

export function ReadAloudProvider({ children }: { children: ReactNode }) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      return true;
    }
  });

  // Mirrored in a ref so `speak` can stay referentially stable — otherwise every
  // toggle would change `speak` and re-fire effects that depend on it (which is
  // what made the narrator repeat itself).
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;
    voiceRef.current = pickVoice();
    const handler = () => {
      voiceRef.current = pickVoice();
    };
    speechSynthesis.addEventListener("voiceschanged", handler);
    return () => speechSynthesis.removeEventListener("voiceschanged", handler);
  }, [supported]);

  // Never leave speech running when the app unmounts.
  useEffect(() => {
    if (!supported) return;
    return () => speechSynthesis.cancel();
  }, [supported]);

  const cancel = useCallback(() => {
    if (!supported) return;
    speechSynthesis.cancel();
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabledRef.current || !text) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      speechSynthesis.speak(utterance);
    },
    [supported],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        /* noop */
      }
      if (!next && supported) speechSynthesis.cancel();
      return next;
    });
  }, [supported]);

  return (
    <ReadAloudContext.Provider value={{ enabled, toggle, speak, cancel }}>
      {children}
    </ReadAloudContext.Provider>
  );
}

const NOOP: ReadAloudValue = {
  enabled: false,
  toggle: () => {},
  speak: () => {},
  cancel: () => {},
};

/** Safe outside a provider (returns inert no-ops) so screens stay reusable. */
export function useReadAloud(): ReadAloudValue {
  return useContext(ReadAloudContext) ?? NOOP;
}
