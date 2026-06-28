export const sessionCookieName = "sales_ai_local_session";

export function encodeSessionCookie(session: unknown) {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSessionCookie(value?: string) {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value)) as {
      email: string;
      role: "admin" | "user";
    };
  } catch {
    return null;
  }
}
