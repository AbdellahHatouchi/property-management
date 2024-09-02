import { getVerificationTokenByEmail } from "@/data/verification-token";
import { generate } from "otp-generator";
import { db } from "./db";
import { TokenType } from "@prisma/client";

export const generateVerificationOTPToken = async (
    email: string,
    type: TokenType = TokenType.EMAIL
) => {
    const OTPToken = generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    // expier token after 15 minutes.
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

    const existingToken = await getVerificationTokenByEmail(email);
    console.log("db");

    if (existingToken) {
        console.log("check");

        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email,
            OTPToken,
            expires,
            type,
        },
    });
    console.log("create verification token");

    return verificationToken;
};
