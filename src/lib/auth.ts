import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { DefaultSession, NextAuthConfig } from "next-auth";

// ─── Type augmentation ────────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    githubUser: {
      login: string;
      avatar: string;
      name: string;
    };
  }
}

// ─── Auth configuration ───────────────────────────────────────────────────────

const config: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const accessToken = account.access_token;
        if (typeof accessToken === "string") {
          token["accessToken"] = accessToken;
        }
        const gh = profile as {
          login?: string;
          avatar_url?: string;
          name?: string;
        };
        token["githubLogin"] = gh.login ?? "";
        token["githubAvatar"] = gh.avatar_url ?? "";
        token["githubName"] = gh.name ?? gh.login ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      const extended = session as typeof session & {
        accessToken: string;
        githubUser: { login: string; avatar: string; name: string };
      };
      extended.accessToken = (token["accessToken"] as string) ?? "";
      extended.githubUser = {
        login: (token["githubLogin"] as string) ?? "",
        avatar: (token["githubAvatar"] as string) ?? "",
        name: (token["githubName"] as string) ?? "",
      };
      return extended;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
