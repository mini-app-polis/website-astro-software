type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

interface LogEvent {
  level: LogLevel;
  category: string;
  message: string;
  ts: string;
  context?: LogContext;
}

function emit(level: LogLevel, payload: string): void {
  const consoleRef = (globalThis as { console?: Console }).console;
  if (!consoleRef) return;
  if (level === "error") {
    consoleRef.error(payload);
    return;
  }
  if (level === "warn") {
    consoleRef.warn(payload);
    return;
  }
  consoleRef.log(payload);
}

function write(level: LogLevel, category: string, message: string, context?: LogContext): void {
  const event: LogEvent = {
    level,
    category,
    message,
    ts: new Date().toISOString(),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
  emit(level, JSON.stringify(event));
}

export const logger = {
  info(category: string, message: string, context?: LogContext): void {
    write("info", category, message, context);
  },
  warn(category: string, message: string, context?: LogContext): void {
    write("warn", category, message, context);
  },
  error(category: string, message: string, context?: LogContext): void {
    write("error", category, message, context);
  },
};
