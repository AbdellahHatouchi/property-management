import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
    DEFAUIT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
} from "./routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return;
    }
    
    // 1. If the request is for an auth route and the user is logged in, redirect to the default page
    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAUIT_LOGIN_REDIRECT, nextUrl));
        }
        return;
    }
    // 2. Redirect non-logged-in users to the sign-in page for protected routes
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return Response.redirect(
            new URL(`/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    return;
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
