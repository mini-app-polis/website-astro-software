/**
 * Structured logger for this site, the one place in src/ that calls console.*.
 *
 * Every event carries timestamp, service, level, category, event and
 * (when non-empty) context, so a call site supplies only the event name,
 * its category and its context.
 */

export type LogCategory = "infra" | "pipeline" | "data" | "api";

export interface LogEvent {
  event: string;
  category: LogCategory;
  context?: Record<string, unknown>;
  error?: unknown;
}

const SERVICE = "website-astro-software";

type Level = "INFO" | "WARN" | "ERROR";

function emit(level: Level, e: LogEvent): void {
  const payload = {
    timestamp: new Date().toISOString(),
    service: SERVICE,
    level,
    category: e.category,
    event: e.event,
    ...(e.context ? { context: e.context } : {}),
    ...(e.error !== undefined ? { error: e.error } : {}),
  };
  const fn = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.info;
  fn(payload);
}

/** Emit structured INFO, WARN and ERROR events for this site. */
export const logger = {
  info: (e: LogEvent): void => emit("INFO", e),
  warn: (e: LogEvent): void => emit("WARN", e),
  error: (e: LogEvent): void => emit("ERROR", e),
};
