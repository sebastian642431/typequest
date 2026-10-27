import launchConfetti from "canvas-confetti";
import { useSettings } from "../state/settings.ts";

let ctx: AudioContext | null = null;

function audio() {
  if (!useSettings.getState().sound) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function note(frequency: number, start: number, duration: number, type: OscillatorType = "triangle", volume = 0.16) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export function playCorrect(combo: number) {
  const base = 523.25 * Math.pow(2, Math.min(combo, 12) / 24);
  note(base, 0, 0.12);
  note(base * 1.5, 0.08, 0.22);
}

export function playWrong() {
  note(196, 0, 0.18, "square", 0.07);
  note(155.56, 0.12, 0.26, "square", 0.07);
}

export function playFinish() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, i * 0.09, 0.3));
}

export function playAchievement() {
  [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => note(f, i * 0.07, 0.35, "sine", 0.14));
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function confetti(strong = false) {
  if (reducedMotion()) return;
  const colors = ["#2c6bc0", "#ffc53d", "#23885a", "#cf3f37", "#7fd4ff"];
  void launchConfetti({ particleCount: strong ? 160 : 90, spread: strong ? 100 : 70, origin: { y: 0.65 }, colors, disableForReducedMotion: true });
  if (strong) {
    setTimeout(() => void launchConfetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors }), 180);
    setTimeout(() => void launchConfetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors }), 260);
  }
}

export function vibrate(ms: number) {
  if (!useSettings.getState().vibration) return;
  if ("vibrate" in navigator) navigator.vibrate?.(ms);
}
