"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Intercepts 401 responses from fetch calls and redirects to /login.
 * Mount this once at the app root so expired tokens trigger a redirect
 * regardless of which component made the failing API call.
 */
export function AuthInterceptor() {
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await originalFetch(...args);
      if (response.status === 401 && !redirected.current) {
        redirected.current = true;
        if (!window.location.pathname.startsWith("/login")) {
          router.push("/login");
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  return null;
}
