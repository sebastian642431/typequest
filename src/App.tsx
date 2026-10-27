import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWorlds } from "./content/useWorlds.ts";
import { dueReviews, useProgress } from "./state/progress.ts";
import { useApplyTheme } from "./state/settings.ts";
import { useRoute } from "./state/route.ts";
import { useLocaleMeta, useT } from "./i18n/index.ts";
import { warmUp } from "./engine/compiler.ts";
import { siteConfig } from "./config/site.ts";
import { Header } from "./layout/Header.tsx";
import { NavBar } from "./layout/NavBar.tsx";
import { AchievementToast } from "./layout/AchievementToast.tsx";
import { AccountPanel } from "./layout/AccountPanel.tsx";
import { Learn } from "./screens/Learn.tsx";
import { Review } from "./screens/Review.tsx";
import { Session, type Item } from "./screens/Session.tsx";

function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  useApplyTheme();
  const t = useT();
  const { tsLocale } = useLocaleMeta();
  const worlds = useWorlds();
  const [route, go] = useRoute();
  const [reviewItems, setReviewItems] = useState<Item[] | null>(null);

  const index = useMemo(() => {
    const map = new Map<string, Item>();
    for (const w of worlds) for (const l of w.lessons) for (const e of l.exercises) {
      const key = `${w.id}/${l.id}/${e.id}`;
      map.set(key, { key, exercise: e });
    }
    return map;
  }, [worlds]);

  const current = useMemo(() => {
    if (!route.lesson) return null;
    const [worldId, lessonId] = route.lesson.split("/");
    const world = worlds.find((w) => w.id === worldId);
    const lesson = world?.lessons.find((l) => l.id === lessonId);
    return world && lesson ? { world, lesson } : null;
  }, [route.lesson, worlds]);

  useEffect(() => {
    if (route.lesson && !current) go({ lesson: null }, true);
  }, [route.lesson, current, go]);

  useEffect(() => {
    if (!route.review) {
      setReviewItems(null);
      return;
    }
    if (reviewItems) return;
    const keys = dueReviews(useProgress.getState().review);
    const items = shuffle(keys.map((k) => index.get(k)).filter((x): x is Item => !!x)).slice(0, 12);
    if (items.length) setReviewItems(items);
    else go({ review: false, view: "review" }, true);
  }, [route.review, reviewItems, index, go]);

  useEffect(() => {
    const id = setTimeout(() => warmUp(tsLocale), 600);
    return () => clearTimeout(id);
  }, [tsLocale]);

  const savedScroll = useRef<Record<string, number>>({});
  const screen = route.lesson ? `lesson:${route.lesson}` : route.review ? "review-session" : route.view;
  const previousScreen = useRef(screen);

  useLayoutEffect(() => {
    const previous = previousScreen.current;
    if (previous === screen) return;
    previousScreen.current = screen;
    window.scrollTo(0, savedScroll.current[screen] ?? 0);
  }, [screen]);

  useEffect(() => {
    const save = () => {
      savedScroll.current[previousScreen.current] = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  useEffect(() => {
    const part = current
      ? `${current.lesson.title} · ${current.world.title}`
      : route.review || route.view === "review"
        ? t.review.title
        : route.account
          ? t.nav[route.account]
          : null;
    document.title = part ? `${part} · ${siteConfig.name}` : siteConfig.seo.title;
  }, [current, route.review, route.view, route.account, t]);

  const exit = () => go({ lesson: null, review: false });

  if (current) {
    const { world, lesson } = current;
    const items = lesson.exercises.map((e) => index.get(`${world.id}/${lesson.id}/${e.id}`)!);
    return (
      <>
        <Session key={`${world.id}/${lesson.id}`} title={lesson.title} lesson={lesson} world={world} items={items} mode="lesson" exit={exit} />
        <AchievementToast />
      </>
    );
  }

  if (route.review && reviewItems) {
    return (
      <>
        <Session key="review" title={t.review.title} items={reviewItems} mode="review" exit={exit} />
        <AchievementToast />
      </>
    );
  }

  return (
    <>
      <Header onHome={() => go({ view: "learn", account: null })} />
      {route.view === "learn" && (
        <Learn
          openLesson={(worldId, lessonId) => go({ lesson: `${worldId}/${lessonId}`, account: null })}
          goReview={() => go({ view: "review" })}
        />
      )}
      {route.view === "review" && <Review start={() => go({ review: true, account: null })} />}
      <NavBar
        current={route.view}
        go={(view) => go({ view, account: null })}
        openProfile={() => go({ account: "profile" })}
        profileOpen={route.account !== null}
      />
      <AccountPanel tab={route.account} onChange={(account) => go({ account }, true)} onClose={() => go({ account: null })} />
      <AchievementToast />
    </>
  );
}
