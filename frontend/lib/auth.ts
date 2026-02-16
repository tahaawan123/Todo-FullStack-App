import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { SignJWT } from "jose";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      // Better Auth requires jwks.remoteUrl when jwt.sign is set (plugin
      // validation). Setting it disables the local JWKS endpoint (returns
      // 404) and no asymmetric keys are created. Actual signing uses the
      // custom HS256 sign function below — JWKS is never used at runtime.
      jwks: {
        remoteUrl: "unused",
        keyPairConfig: { alg: "EdDSA" },
      },
      jwt: {
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
        }),
        sign: async (payload) => {
          const secret = new TextEncoder().encode(
            process.env.BETTER_AUTH_SECRET!,
          );
          return new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .sign(secret);
        },
      },
    }),
    nextCookies(),
  ],
});
