import { describe, expect, it } from "vitest";
import { buildSearch, parseRoute } from "./route.ts";

describe("route", () => {
  it("no params means Learn", () => {
    expect(parseRoute("")).toEqual({ view: "learn", lesson: null, review: false, account: null });
  });

  it("reads lesson, view and account", () => {
    expect(parseRoute("?lesson=basics/primitives").lesson).toBe("basics/primitives");
    expect(parseRoute("?view=review").view).toBe("review");
    expect(parseRoute("?account=achievements").account).toBe("achievements");
    expect(parseRoute("?account=anything").account).toBeNull();
  });

  it("round trip keeps the route", () => {
    for (const s of ["", "?lesson=hacker/ts7", "?view=review", "?account=settings", "?view=review&account=profile", "?review=1"]) {
      expect(buildSearch(parseRoute(s))).toBe(s);
    }
  });

  it("the lesson wins over the rest", () => {
    expect(buildSearch({ view: "review", lesson: "real-world/result", review: true, account: "achievements" })).toBe("?lesson=real-world/result");
  });
});
