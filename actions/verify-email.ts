"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TokenType } from "@prisma/client";

export const VerifyEmail = async ({
    OTPVerify,
    type = TokenType.EMAIL,
    requiredAuth = true,
    email,
}: {
    OTPVerify: string;
    type: TokenType;
    requiredAuth?: boolean;
    email?: string;
}) => {
    try {
        let existingUser = null;
        const session = await auth();
        const user = session?.user;
        if (requiredAuth) {

            // Check if user and user email exist
            if (!user || !user.email || !user.id) {
                return {
                    error: "Unauthenticated",
                    success: "",
                    status: 403,
                };
            }
            // Find existing user by email
            existingUser = await db.user.findUnique({
                where: {
                    id: user.id,
                },
            });
        } else {
            // Find existing user by email
            if (email) {
                existingUser = await db.user.findUnique({
                    where: {
                        email,
                    },
                });
            }
        }

        // Check if user exists in the database
        if (!existingUser) {
            return { error: "Invalid User", success: "", status: 403 };
        }

        // Verify the OTP
        const isValidOTP = await verifyOTP(existingUser.email, OTPVerify, type);
        if (!isValidOTP) {
            return { error: "Invalide OTP Code", success: "", status: 400 };
        }

        // Update the user's email verification status
        await db.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                emailVerified: new Date(),
            },
        });

        const successMessage =
            type === TokenType.EMAIL
                ? "Email verified successfully"
                : "Code verification successfully";
        return { error: "", success: successMessage, status: 200 };
    } catch (error) {
        return { error: "Something went wrong!", success: "", status: 500 };
    }
};

// Mock function to verify OTP
async function verifyOTP(
    email: string,
    OTP: string,
    type: TokenType
): Promise<boolean> {
    const storedOTP = await db.verificationToken.findUnique({
        where: {
            email,
            OTPToken: OTP,
            type,
        },
    });

    if (storedOTP) {
        // Check if the OTP has expired
        const currentTime = new Date();
        if (storedOTP.expires > currentTime) {
            // If OTP is valid, delete it from the database
            await db.verificationToken.delete({
                where: {
                    id: storedOTP.id,
                },
            });
            return true;
        }
    }

    return false;
}
