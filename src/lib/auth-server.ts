import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

// Resolve the public base URL of this app.
// Better Auth derives its trusted origins from the base URL, so a base URL of
// "http://localhost:3000" on a production host makes every login POST fail with
// 403 INVALID_ORIGIN (the browser sends Origin: https://<live-domain>).
//
// Priority:
//   1. BETTER_AUTH_URL — only when it is a real (non-localhost) URL.
//   2. The Vercel production URL (auto-provided at runtime on Vercel).
//   3. The current Vercel deployment URL (covers preview deployments too).
//   4. Localhost fallback for local development.
const isLocalhost = (url: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(url);

const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const vercelDeploymentUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const baseURL =
  process.env.BETTER_AUTH_URL && !isLocalhost(process.env.BETTER_AUTH_URL)
    ? process.env.BETTER_AUTH_URL
    : (vercelProductionUrl ?? vercelDeploymentUrl ?? "http://localhost:3000");

const trustedOrigins = [
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
  ...(vercelProductionUrl ? [vercelProductionUrl] : []),
  ...(vercelDeploymentUrl ? [vercelDeploymentUrl] : []),
];

export const auth = betterAuth({
  baseURL,
  ...(trustedOrigins.length > 0 ? { trustedOrigins } : {}),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh every 24 hours
  },
});
