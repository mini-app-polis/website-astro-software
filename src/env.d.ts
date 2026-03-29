/// <reference path="../.astro/types.d.ts" />

declare global {
  interface Window {
    onTurnstileVerified?: (token: string) => void;
  }
}

export {};