import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets and image
     * optimization files, so the auth session cookie stays fresh
     * everywhere it matters without wasted work on static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw\\.js|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
