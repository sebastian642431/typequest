import { useEffect, useState } from "react";
import * as Comlink from "comlink";
import type { CompilerApi } from "./worker.ts";
import { PRELUDE, type Diagnostic } from "./checker.ts";

let remote: Comlink.Remote<CompilerApi> | null = null;

export function compiler() {
  if (!remote) {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    remote = Comlink.wrap<CompilerApi>(worker);
  }
  return remote;
}

export function warmUp(tsLocale: string) {
  void compiler().setLocale(tsLocale);
}

export type CheckResult = {
  ok: boolean;
  own: Diagnostic[];
  tests: Diagnostic[];
};

export async function check(code: string, tests: string): Promise<CheckResult> {
  const codeLines = code.split("\n").length;
  const full = `${code}\n${PRELUDE}${tests}\nexport {};\n`;
  const diags = await compiler().diagnose(full);
  const offset = codeLines + PRELUDE.split("\n").length - 1;
  return {
    ok: diags.length === 0,
    own: diags.filter((d) => d.line < codeLines),
    tests: diags.filter((d) => d.line >= codeLines).map((d) => ({ ...d, line: d.line - offset })),
  };
}

const errorCache = new Map<string, Diagnostic[]>();

export function useCompilerErrors(code: string | undefined, active = true) {
  const [errors, setErrors] = useState<Diagnostic[]>(() => (code && errorCache.get(code)) || []);
  useEffect(() => {
    if (!code || !active) {
      setErrors([]);
      return;
    }
    const cached = errorCache.get(code);
    if (cached) {
      setErrors(cached);
      return;
    }
    let alive = true;
    void check(code, "").then((r) => {
      errorCache.set(code, r.own);
      if (alive) setErrors(r.own);
    });
    return () => {
      alive = false;
    };
  }, [code, active]);
  return errors;
}
