import * as Comlink from "comlink";
import ts from "ts-web";
import { createChecker } from "./checker.ts";

const rawLibs = import.meta.glob<string>(
  ["/node_modules/ts-web/lib/lib.es5.d.ts", "/node_modules/ts-web/lib/lib.es20*.d.ts", "/node_modules/ts-web/lib/lib.decorators*.d.ts", "!**/*.full.d.ts"],
  { query: "?raw", import: "default", eager: true },
);

const messages = import.meta.glob<Record<string, string>>("/node_modules/ts-web/lib/*/diagnosticMessages.generated.json", {
  import: "default",
});

const libs: Record<string, string> = {};
for (const [path, text] of Object.entries(rawLibs)) libs[path.split("/").pop()!] = text;

const localize = (ts as unknown as { setLocalizedDiagnosticMessages: (m: unknown) => void }).setLocalizedDiagnosticMessages;
const checker = createChecker(ts, libs);

const api = {
  diagnose: (code: string) => checker.diagnose(code),
  setLocale: async (locale: string) => {
    const load = messages[`/node_modules/ts-web/lib/${locale}/diagnosticMessages.generated.json`];
    localize(load ? await load() : undefined);
  },
  ready: () => true,
};

export type CompilerApi = typeof api;

Comlink.expose(api);
