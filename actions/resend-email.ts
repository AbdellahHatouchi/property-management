"use server";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { sendVerificationOTP } from "@/lib/send-verification-otp";

export const resendEmail = async () => {
    try {
        // Authenticate user and get session data
        const session = await auth();
        const user = session?.user;

        // Check if user is authenticated and has a valid email
        if (!user || !user.email || !user.id) {
            return {
                error: "Unauthenticated",
                success: "",
                status: 403,
            };
        }

        const existingUser = await getUserById(user.id);

        if (!existingUser) {
            return {
                error: "Unauthenticated",
                success: "",
                status: 403,
            };
        }

        // Send the verification OTP to the user's email
        await sendVerificationOTP(existingUser.email);

        return {
            error: "",
            success: "Verification email sent successfully.",
            status: 200,
        };
    } catch (error) {
        console.error("Error resending email verification OTP:", error);

        return {
            error: "Failed to send verification email. Please try again later.",
            success: "",
            status: 500,
        };
    }
};
