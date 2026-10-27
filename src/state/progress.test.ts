import { beforeEach, describe, expect, it, vi } from "vitest";
import { DAILY_GOAL, MAX_LIVES, levelFor, dueReviews, useProgress } from "./progress.ts";

const DAY = 24 * 60 * 60 * 1000;
const p = () => useProgress.getState();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 27, 12));
  p().reset();
});

describe("level", () => {
  it("rises along the curve", () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(49).level).toBe(1);
    expect(levelFor(50).level).toBe(2);
    expect(levelFor(150).level).toBe(3);
  });
});

describe("review", () => {
  it("a wrong answer is due today", () => {
    p().markWrong("basics/x/1");
    expect(dueReviews(p().review)).toEqual(["basics/x/1"]);
  });

  it("getting it right in the same lesson moves it to tomorrow", () => {
    p().markWrong("basics/x/1");
    p().markCorrect("basics/x/1", false, 1);
    expect(dueReviews(p().review)).toEqual([]);
    vi.setSystemTime(Date.now() + DAY + 1);
    expect(dueReviews(p().review)).toEqual(["basics/x/1"]);
  });

  it("getting it right in review extends the interval and gives back a life", () => {
    p().markWrong("basics/x/1");
    p().loseLife();
    p().markCorrect("basics/x/1", true, 1);
    expect(p().lives).toBe(MAX_LIVES);
    expect(p().review["basics/x/1"].due).toBe(Date.now() + DAY);
  });

  it("goes through 1, 3, 7, 14 and 30 days and then leaves the queue", () => {
    p().markWrong("basics/x/1");
    for (const days of [1, 3, 7, 14, 30]) {
      p().markCorrect("basics/x/1", true, 1);
      expect(p().review["basics/x/1"].due).toBe(Date.now() + days * DAY);
    }
    p().markCorrect("basics/x/1", true, 1);
    expect(p().review["basics/x/1"]).toBeUndefined();
  });
});

describe("streak and achievements", () => {
  it("counts consecutive days and breaks if you skip one", () => {
    p().finishLesson("basics/a", 1);
    vi.setSystemTime(Date.now() + DAY);
    p().finishLesson("basics/b", 1);
    expect(p().streak).toBe(2);
    vi.setSystemTime(Date.now() + 2 * DAY);
    p().finishLesson("basics/c", 1);
    expect(p().streak).toBe(1);
  });

  it("the daily goal unlocks its achievement only once", () => {
    p().addXp(DAILY_GOAL);
    p().addXp(10);
    expect(p().achievements["daily-goal"]).toBeDefined();
    expect(p().unseen.filter((n) => n === "daily-goal")).toHaveLength(1);
  });

  it("lives never go below zero", () => {
    for (let i = 0; i < MAX_LIVES + 3; i++) p().loseLife();
    expect(p().lives).toBe(0);
  });
});

describe("marking lessons as done", () => {
  it("marks without XP and keeps real progress untouched", () => {
    p().finishLesson("basics/a", 0.5);
    p().markDone(["basics/a", "basics/b"]);
    expect(p().xp).toBe(0);
    expect(p().lessons["basics/a"].marked).toBeUndefined();
    expect(p().lessons["basics/b"]).toEqual({ best: 0, plays: 0, marked: true });
  });

  it("unmark only removes marked lessons", () => {
    p().finishLesson("basics/a", 1);
    p().markDone(["basics/b"]);
    p().unmark("basics/a");
    p().unmark("basics/b");
    expect(p().lessons["basics/a"]).toBeDefined();
    expect(p().lessons["basics/b"]).toBeUndefined();
  });

  it("playing a marked lesson replaces the mark with the real result", () => {
    p().markDone(["basics/b"]);
    p().finishLesson("basics/b", 0.8);
    expect(p().lessons["basics/b"]).toEqual({ best: 0.8, plays: 1 });
  });
});
