import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_LIVES = 5;
export const DAILY_GOAL = 50;
const MINUTES_PER_LIFE = 20;
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [0, 1, 3, 7, 14, 30];

type ReviewCard = { level: number; due: number };

export const ACHIEVEMENT_ORDER = [
  "first-lesson",
  "perfect",
  "combo-5",
  "combo-10",
  "combo-25",
  "streak-3",
  "streak-7",
  "streak-30",
  "correct-50",
  "correct-250",
  "correct-1000",
  "review-10",
  "daily-goal",
  "level-10",
  "boss",
  "world-basics",
  "world-intermediate",
  "world-advanced",
  "world-hacker",
  "world-real-world",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_ORDER)[number];

export function levelFor(xp: number) {
  let n = 1;
  while (xp >= 25 * n * (n + 1)) n++;
  const from = 25 * (n - 1) * n;
  const to = 25 * n * (n + 1);
  return { level: n, progress: (xp - from) / (to - from), remaining: to - xp };
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function yesterday() {
  const d = new Date(Date.now() - DAY);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

type Progress = {
  xp: number;
  xpToday: { day: string; xp: number };
  lives: number;
  livesSince: number;
  streak: number;
  lastDay: string | null;
  lessons: Record<string, { best: number; plays: number; marked?: boolean }>;
  review: Record<string, ReviewCard>;
  correctCount: number;
  reviewCorrectCount: number;
  bestCombo: number;
  achievements: Partial<Record<AchievementId, number>>;
  unseen: AchievementId[];
  refillLives: () => void;
  loseLife: () => void;
  addXp: (n: number) => void;
  markWrong: (key: string) => void;
  markCorrect: (key: string, inReview: boolean, combo: number) => void;
  finishLesson: (key: string, accuracy: number) => void;
  markDone: (keys: string[]) => void;
  unmark: (key: string) => void;
  reset: () => void;
  unlock: (id: AchievementId) => void;
  clearUnseen: () => void;
};

export const useProgress = create<Progress>()(
  persist(
    (set, get) => ({
      xp: 0,
      xpToday: { day: today(), xp: 0 },
      lives: MAX_LIVES,
      livesSince: Date.now(),
      streak: 0,
      lastDay: null,
      lessons: {},
      review: {},
      correctCount: 0,
      reviewCorrectCount: 0,
      bestCombo: 0,
      achievements: {},
      unseen: [],
      refillLives: () => {
        const { lives, livesSince } = get();
        if (lives >= MAX_LIVES) return set({ livesSince: Date.now() });
        const earned = Math.floor((Date.now() - livesSince) / (MINUTES_PER_LIFE * 60000));
        if (earned <= 0) return;
        const next = Math.min(MAX_LIVES, lives + earned);
        set({ lives: next, livesSince: next >= MAX_LIVES ? Date.now() : livesSince + earned * MINUTES_PER_LIFE * 60000 });
      },
      loseLife: () => {
        const { lives } = get();
        set({ lives: Math.max(0, lives - 1), livesSince: lives >= MAX_LIVES ? Date.now() : get().livesSince });
      },
      addXp: (n) => {
        const day = today();
        const before = get().xpToday.day === day ? get().xpToday.xp : 0;
        const xp = get().xp + n;
        set({ xp, xpToday: { day, xp: before + n } });
        if (before < DAILY_GOAL && before + n >= DAILY_GOAL) get().unlock("daily-goal");
        if (levelFor(xp).level >= 10) get().unlock("level-10");
      },
      markWrong: (key) => set({ review: { ...get().review, [key]: { level: 0, due: Date.now() } } }),
      markCorrect: (key, inReview, combo) => {
        const correctCount = get().correctCount + 1;
        const bestCombo = Math.max(get().bestCombo, combo);
        set({ correctCount, bestCombo });
        if (correctCount >= 50) get().unlock("correct-50");
        if (correctCount >= 250) get().unlock("correct-250");
        if (correctCount >= 1000) get().unlock("correct-1000");
        if (combo >= 5) get().unlock("combo-5");
        if (combo >= 10) get().unlock("combo-10");
        if (combo >= 25) get().unlock("combo-25");
        const current = get().review[key];
        if (!current) return;
        if (!inReview) {
          if (current.due <= Date.now()) set({ review: { ...get().review, [key]: { level: current.level, due: Date.now() + DAY } } });
          return;
        }
        const level = current.level + 1;
        const review = { ...get().review };
        if (level >= INTERVALS.length) delete review[key];
        else review[key] = { level, due: Date.now() + INTERVALS[level] * DAY };
        const reviewCorrectCount = get().reviewCorrectCount + 1;
        set({ review, lives: Math.min(MAX_LIVES, get().lives + 1), reviewCorrectCount });
        if (reviewCorrectCount >= 10) get().unlock("review-10");
      },
      finishLesson: (key, accuracy) => {
        const previous = get().lessons[key];
        const day = today();
        const { lastDay, streak } = get();
        const newStreak = lastDay === day ? streak : lastDay === yesterday() ? streak + 1 : 1;
        set({
          lessons: { ...get().lessons, [key]: { best: Math.max(previous?.best ?? 0, accuracy), plays: (previous?.plays ?? 0) + 1 } },
          streak: newStreak,
          lastDay: day,
        });
        get().unlock("first-lesson");
        if (accuracy >= 1) get().unlock("perfect");
        if (newStreak >= 3) get().unlock("streak-3");
        if (newStreak >= 7) get().unlock("streak-7");
        if (newStreak >= 30) get().unlock("streak-30");
      },
      unlock: (id) => {
        if (get().achievements[id]) return;
        set({ achievements: { ...get().achievements, [id]: Date.now() }, unseen: [...get().unseen, id] });
      },
      clearUnseen: () => set({ unseen: [] }),
      markDone: (keys) => {
        const lessons = { ...get().lessons };
        for (const key of keys) if (!lessons[key]) lessons[key] = { best: 0, plays: 0, marked: true };
        set({ lessons });
      },
      unmark: (key) => {
        if (!get().lessons[key]?.marked) return;
        const lessons = { ...get().lessons };
        delete lessons[key];
        set({ lessons });
      },
      reset: () =>
        set({
          xp: 0,
          xpToday: { day: today(), xp: 0 },
          lives: MAX_LIVES,
          livesSince: Date.now(),
          streak: 0,
          lastDay: null,
          lessons: {},
          review: {},
          correctCount: 0,
          reviewCorrectCount: 0,
          bestCombo: 0,
          achievements: {},
          unseen: [],
        }),
    }),
    {
      name: "typequest-progress",
      version: 1,
      partialize: ({ unseen: _unseen, ...rest }) => rest,
    },
  ),
);

export function currentStreak(streak: number, lastDay: string | null) {
  return lastDay === today() || lastDay === yesterday() ? streak : 0;
}

export function dueReviews(review: Record<string, ReviewCard>) {
  const now = Date.now();
  return Object.entries(review)
    .filter(([, c]) => c.due <= now)
    .map(([key]) => key);
}
