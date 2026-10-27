import type baseMessages from "../locales/es/messages.ts";

export type LocaleMeta = { name: string; tsLocale: string; voiceLang: string };

export type Messages = typeof baseMessages;

type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export type LocaleMessages = DeepPartial<Messages>;
