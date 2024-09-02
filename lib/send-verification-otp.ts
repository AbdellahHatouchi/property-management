import { render } from "@react-email/render";
import { generateVerificationOTPToken } from "./tokens";
import VerifyEmail from "@/components/mail/verify-email";
import { sendMail } from "./mail";

export const sendVerificationOTP = async (email: string) => {
    const verificationToken = await generateVerificationOTPToken(email);
    const emailContent = await render(VerifyEmail(verificationToken.OTPToken), {
        pretty: true,
    });

    await sendMail({
        to: email,
        subject: "Verification Email",
        emailContent,
    });
};
