/**
 * Short nonverbal game sounds generated with WebAudio.
 * No narration in Milestone 1 — `settings.enabled` is the hook for a
 * future sound/voice options screen.
 */
export const soundSettings = {
  enabled: true,
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startDelay: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12,
) {
  const ac = getCtx();
  if (!ac || !soundSettings.enabled) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t = ac.currentTime + startDelay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sounds = {
  click() {
    tone(600, 0, 0.08, "triangle", 0.08);
  },
  correct() {
    // bright ascending chime
    tone(660, 0, 0.15, "sine");
    tone(880, 0.09, 0.18, "sine");
    tone(1320, 0.18, 0.3, "sine", 0.1);
  },
  incorrect() {
    // soft, gentle low tone — never harsh
    tone(330, 0, 0.25, "sine", 0.07);
    tone(262, 0.12, 0.3, "sine", 0.06);
  },
  levelComplete() {
    tone(523, 0, 0.18, "triangle");
    tone(659, 0.14, 0.18, "triangle");
    tone(784, 0.28, 0.18, "triangle");
    tone(1047, 0.42, 0.5, "triangle", 0.14);
  },
};
