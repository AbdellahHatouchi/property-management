import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schema";
import { getUserByEmail } from "./data/user";
import bcrypt from "bcryptjs";
import Google from 'next-auth/providers/google';
// import { generateVerificationOTPToken } from "./lib/tokens";
// import { sendVerificationEmail } from "./lib/mail";

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        Credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;

                    const user = await getUserByEmail(email);
                    // if i want use providers like google
                    if (!user || !user.password) return null;

                    const pwdIsMatch = await bcrypt.compare(
                        password,
                        user.password
                    );

                    if (pwdIsMatch) return user;
                    // if (pwdIsMatch && user.isActive) {
                    //     if (!user.emailVerified) {
                    //         const verificationToken =
                    //             await generateVerificationOTPToken(user.email);

                    //         await sendVerificationEmail(
                    //             verificationToken.email,
                    //             verificationToken.OTPToken
                    //         );
                    //     }
                    //     return user;
                    // }
                }
                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
