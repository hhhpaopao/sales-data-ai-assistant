import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSessionCookie, sessionCookieName } from "./session-cookie";

export async function requireLocalSession(requiredRole?: "admin") {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(sessionCookieName)?.value);

  if (!session) {
    redirect("/login");
  }

  if (requiredRole === "admin" && session.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
