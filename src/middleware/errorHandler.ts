import type { NextFunction, Request, Response } from "express";

// Single consistent error shape: { success:false, data:null, message, error }
// Mongoose validation/cast failures become 400s with the real message so forms
// show what is wrong instead of a generic "Internal server error".
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const name = typeof err === "object" && err !== null && "name" in err ? String((err as { name: unknown }).name) : "";
  const isClientError = name === "ValidationError" || name === "CastError";
  const status = isClientError
    ? 400
    : typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status: unknown }).status) || 500
      : 500;
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(status >= 400 && status < 600 ? status : 500).json({
    success: false,
    data: null,
    message: status === 500 ? "Internal server error" : message,
    error: message,
  });
}

export function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}
