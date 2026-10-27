import confetti from "canvas-confetti";
import { useProgreso } from "../estado/progreso.ts";

let ctx: AudioContext | null = null;

function audio() {
  if (!useProgreso.getState().sonido) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function nota(frecuencia: number, inicio: number, duracion: number, tipo: OscillatorType = "triangle", volumen = 0.16) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + inicio;
  const osc = a.createOscillator();
  const gan = a.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, t);
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.exponentialRampToValueAtTime(volumen, t + 0.012);
  gan.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(gan).connect(a.destination);
  osc.start(t);
  osc.stop(t + duracion + 0.02);
}

export function sonidoAcierto(combo: number) {
  const base = 523.25 * Math.pow(2, Math.min(combo, 12) / 24);
  nota(base, 0, 0.12);
  nota(base * 1.5, 0.08, 0.22);
}

export function sonidoError() {
  nota(196, 0, 0.18, "square", 0.07);
  nota(155.56, 0.12, 0.26, "square", 0.07);
}

export function sonidoFin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(f, i * 0.09, 0.3));
}

export function sonidoLogro() {
  [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => nota(f, i * 0.07, 0.35, "sine", 0.14));
}

const sinMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function confeti(fuerte = false) {
  if (sinMovimiento()) return;
  const colores = ["#2c6bc0", "#ffc53d", "#23885a", "#cf3f37", "#7fd4ff"];
  void confetti({ particleCount: fuerte ? 160 : 90, spread: fuerte ? 100 : 70, origin: { y: 0.65 }, colors: colores, disableForReducedMotion: true });
  if (fuerte) {
    setTimeout(() => void confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: colores }), 180);
    setTimeout(() => void confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: colores }), 260);
  }
}

export function vibrar(ms: number) {
  if ("vibrate" in navigator) navigator.vibrate?.(ms);
}
