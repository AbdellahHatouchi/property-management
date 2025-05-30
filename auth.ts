import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { getUserById, verifiedUserById } from "./data/user";
import { DefaultSession } from "next-auth";
import { db } from "./lib/db";
// The `JWT` interface can be found in the `next-auth/jwt` submodule
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        emailVerified: Date | null;
    }
}

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            emailVerified: Date | null;
            /**
             * By default, TypeScript merges new interface properties and overwrites existing ones.
             * In this case, the default session user properties will be overwritten,
             * with the new ones defined above. To keep the default session user properties,
             * you need to add them back into the newly declared interface.
             */
        } & DefaultSession["user"];
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/sign-in",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.emailVerified && session.user) {
                session.user.emailVerified = token.emailVerified;
            }
            return session;
        },
        async jwt({ token, trigger, user, profile,account }) {
            if (trigger === 'signUp' && account?.provider === "google" && profile?.email_verified){
                if (user.id){
                    console.log(user.id);
                    
                    const existingUser = await verifiedUserById(user.id);
                }
            }

            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if (!existingUser) return token;

            token.emailVerified = existingUser.emailVerified;

            return token;
        },
    },
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 1 day in seconds
        updateAge: 24 * 60 * 60, // 1 day in seconds
    },
    jwt: {
        maxAge: 24 * 60 * 60, // 1 day in seconds
    },
    ...authConfig,
});
